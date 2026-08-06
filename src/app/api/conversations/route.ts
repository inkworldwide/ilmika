import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: user.id },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const counterpart = conv.participants.find(p => p.id !== user.id) || null;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: user.id,
            isRead: false,
          },
        });

        const lastMessage = conv.messages[0] || null;

        return {
          id: conv.id,
          college: conv.college || null,
          counterpart,
          lastMessage,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
