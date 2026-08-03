import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate Limiting: max 10 messages per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`message_${ip}`, 10, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many messages. Please slow down." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to send chat messages." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate content
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Verify property and get owner details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true, ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // A user cannot start a chat thread with themselves
    if (property.ownerId === user.id) {
      return NextResponse.json(
        { error: "You cannot send messages to yourself." },
        { status: 400 }
      );
    }

    // Execute in a transaction to guarantee atomic conversation thread updates
    const message = await prisma.$transaction(async (tx) => {
      // 1. Find existing conversation linking these two users on this property
      let conversation = await tx.conversation.findFirst({
        where: {
          propertyId,
          AND: [
            { participants: { some: { id: user.id } } },
            { participants: { some: { id: property.ownerId } } },
          ],
        },
      });

      // 2. If no thread exists, create a new one
      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            propertyId,
            participants: {
              connect: [{ id: user.id }, { id: property.ownerId }],
            },
          },
        });
      }

      // 3. Create the Message
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          receiverId: property.ownerId,
          content,
        },
      });

      // 4. Update Conversation timestamp
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      // 5. Fire Notification to the owner and Admins
      const admins = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      const notifyUserIds = Array.from(new Set([property.ownerId, ...admins.map(a => a.id)]));

      for (const uid of notifyUserIds) {
        await tx.notification.create({
          data: {
            userId: uid,
            type: NotificationType.MESSAGE_RECEIVED,
            message: `💬 New message from ${user.name} regarding property: "${property.title}"`,
          },
        });
      }

      return msg;
    });

    return NextResponse.json(
      { message: "Message sent successfully", chatMessage: message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Direct message send error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred sending direct message" },
      { status: 500 }
    );
  }
}
