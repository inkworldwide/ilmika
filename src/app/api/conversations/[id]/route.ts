import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationType } from "@prisma/client";

const replySchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

// GET - Retrieve conversation messages and mark as read
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Mark incoming messages as read in this thread
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Fetch all messages in the thread
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error: any) {
    console.error("Fetch thread messages error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}

// POST - Reply to conversation thread (Atomic Transaction)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Verify conversation and get participants
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      include: {
        participants: true,
        property: { select: { title: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Find the receiver (the other participant)
    const receiver = conversation.participants.find(p => p.id !== user.id);
    if (!receiver) {
      return NextResponse.json(
        { error: "Conversation participant error" },
        { status: 400 }
      );
    }

    // Execute database writes inside a transaction
    const message = await prisma.$transaction(async (tx) => {
      // 1. Create the reply Message
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId: user.id,
          receiverId: receiver.id,
          content,
        },
      });

      // 2. Update conversation updatedAt timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // 3. Create Notification for receiver
      const propTitle = conversation.property ? ` regarding "${conversation.property.title}"` : "";
      await tx.notification.create({
        data: {
          userId: receiver.id,
          type: NotificationType.MESSAGE_RECEIVED,
          message: `New message from ${user.name}${propTitle}`,
        },
      });

      return msg;
    });

    return NextResponse.json(
      { message: "Reply sent successfully", chatMessage: message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Reply sending error:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
