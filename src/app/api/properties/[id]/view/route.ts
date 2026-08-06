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

    await prisma.college.update({
      where: { id: collegeId },
      data: { viewCount: { increment: 1 } },
    });

    if (user) {
      await prisma.recentlyViewed.upsert({
        where: { userId_collegeId: { userId: user.id, collegeId } },
        create: { userId: user.id, collegeId },
        update: { viewedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
