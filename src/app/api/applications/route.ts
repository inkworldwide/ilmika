import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
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

    let studentId = user?.id;
    if (!studentId) {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { email: "student@inkeduverse.com" },
            { role: "USER" },
          ],
        },
        select: { id: true },
      });
      studentId = dbUser?.id || college.ownerId;
    }

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
