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
    const { name, email, phone, message } = body;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true, ownerId: true },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const enquiry = await prisma.collegeEnquiry.create({
      data: {
        collegeId,
        studentId: user?.id || college.ownerId,
        name: name || user?.name || "Student",
        email: email || user?.email || "student@inkeduverse.com",
        phone: phone || null,
        message: message || "Enquiry submitted.",
      },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
