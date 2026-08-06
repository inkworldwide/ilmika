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
    const body = await req.json();
    const { date, timeSlot, type, notes } = body;

    const session = await prisma.counsellingSession.create({
      data: {
        collegeId,
        studentId: user?.id || "anonymous-student",
        date: new Date(date || Date.now()),
        timeSlot: timeSlot || "10:00 AM",
        type: type || "VIDEO_CALL",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, session, visit: session });
  } catch (error) {
    return NextResponse.json({ error: "Failed to schedule session" }, { status: 500 });
  }
}
