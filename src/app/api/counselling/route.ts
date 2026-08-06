import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { collegeId, date, timeSlot, type, notes } = body;

    if (!collegeId || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { ownerId: true },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    let studentId = user?.id;
    if (!studentId) {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: "student@inkeduverse.com" },
            { role: "USER" },
          ],
        },
        select: { id: true },
      });
      studentId = dbUser?.id || college.ownerId;
    }

    const session = await prisma.counsellingSession.create({
      data: {
        collegeId,
        studentId,
        date: new Date(date),
        timeSlot,
        type: type || "VIDEO_CALL",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Error booking counselling session:", error);
    return NextResponse.json({ error: "Failed to book session" }, { status: 500 });
  }
}
