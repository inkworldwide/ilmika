import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to book a counselling session" }, { status: 401 });
    }

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

    const studentId = user.id;

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
