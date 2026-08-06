import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const callbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(5, "Valid phone number required"),
  preferredTime: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collegeId } = await params;
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    const parsed = callbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, phone, preferredTime } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { name: true, ownerId: true },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    await prisma.collegeEnquiry.create({
      data: {
        collegeId,
        studentId: user?.id || college.ownerId,
        name,
        email: user?.email || `${phone}@callback.inkeduverse.com`,
        phone,
        message: preferredTime
          ? `📞 Callback Request — Please call me back at ${phone}. Preferred time: ${preferredTime}`
          : `📞 Callback Request — Please call me back at ${phone}.`,
      },
    });

    return NextResponse.json({ message: "Callback request submitted." }, { status: 201 });
  } catch (error: any) {
    console.error("Callback request error:", error);
    return NextResponse.json({ error: "Failed to process callback request" }, { status: 500 });
  }
}
