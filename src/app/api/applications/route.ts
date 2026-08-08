import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a college application" }, { status: 401 });
    }

    const body = await req.json();
    const { collegeId, courseId, name, email, phone, message } = body;

    if (!collegeId || !name || !email) {
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

    const application = await prisma.application.create({
      data: {
        collegeId,
        courseId: courseId || null,
        studentId,
        name,
        email,
        phone: phone || null,
        message: message || null,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
