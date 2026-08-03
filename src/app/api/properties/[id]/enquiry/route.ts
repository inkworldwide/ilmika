import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { EnquiryStatus, NotificationType } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate Limiting: max 4 enquiries per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`enquiry_${ip}`, 4, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many enquiries. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to send enquiries." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = parsed.data;

    // Verify property and get owner details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true, ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Atomic transaction for writing Enquiry and Notification
    const enquiry = await prisma.$transaction(async (tx) => {
      // 1. Create Enquiry
      const enq = await tx.enquiry.create({
        data: {
          propertyId,
          senderId: user.id,
          name,
          email,
          phone,
          message,
          status: EnquiryStatus.NEW,
        },
      });

      // 2. Create Notification for Property Owner and Admins
      const admins = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      const notifyUserIds = Array.from(new Set([property.ownerId, ...admins.map(a => a.id)]));

      for (const uid of notifyUserIds) {
        await tx.notification.create({
          data: {
            userId: uid,
            type: NotificationType.ENQUIRY,
            message: `📩 New enquiry received from ${name} (${phone}) for listing: "${property.title}"`,
          },
        });
      }

      return enq;
    });

    return NextResponse.json(
      { message: "Enquiry submitted successfully", enquiry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred submitting enquiry" },
      { status: 500 }
    );
  }
}
