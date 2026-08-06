import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collegeId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { ownerId: true },
    });

    if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });

    let conversation = await prisma.conversation.findFirst({
      where: {
        collegeId,
        participants: { every: { id: { in: [user.id, college.ownerId] } } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          collegeId,
          participants: { connect: [{ id: user.id }, { id: college.ownerId }] },
        },
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to initiate message" }, { status: 500 });
  }
}
