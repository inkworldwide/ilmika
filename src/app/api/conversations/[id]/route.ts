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
        college: {
          select: {
            id: true,
            name: true,
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

    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

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

// POST - Reply to conversation thread
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

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      include: {
        participants: true,
        college: { select: { name: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    const receiver = conversation.participants.find(p => p.id !== user.id);
    if (!receiver) {
      return NextResponse.json(
        { error: "Conversation participant error" },
        { status: 400 }
      );
    }

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId: user.id,
          receiverId: receiver.id,
          content,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      const colTitle = conversation.college ? ` regarding "${conversation.college.name}"` : "";
      await tx.notification.create({
        data: {
          userId: receiver.id,
          type: NotificationType.MESSAGE_RECEIVED,
          message: `New message from ${user.name}${colTitle}`,
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
