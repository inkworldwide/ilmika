import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { collegeId, name, email, phone, message } = body;

    if (!collegeId || !name || !email || !message) {
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

    const enquiry = await prisma.collegeEnquiry.create({
      data: {
        collegeId,
        studentId,
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
