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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.shortlist.findUnique({
      where: { userId_collegeId: { userId: user.id, collegeId } },
    });

    if (existing) {
      await prisma.shortlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isShortlisted: false });
    } else {
      await prisma.shortlist.create({
        data: { userId: user.id, collegeId },
      });
      return NextResponse.json({ isShortlisted: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update shortlist" }, { status: 500 });
  }
}
