import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { VisitStatus, VisitType, NotificationType } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const visitSchema = z.object({
  date: z.string().min(1, "Tour date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  type: z.enum(["IN_PERSON", "VIDEO_TOUR"]),
  message: z.string().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate Limiting: max 4 visit requests per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`visit_${ip}`, 4, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many visit booking requests. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to request tours." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = visitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date, timeSlot, type, message } = parsed.data;

    // Verify date is not in the past
    const tourDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tourDate < today) {
      return NextResponse.json(
        { error: "You cannot schedule a visit in the past." },
        { status: 400 }
      );
    }

    // Verify property and get owner details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true, ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Atomic transaction for writing Visit and Notification
    const visit = await prisma.$transaction(async (tx) => {
      // 1. Create Visit booking request
      const vis = await tx.visit.create({
        data: {
          propertyId,
          visitorId: user.id,
          date: tourDate,
          timeSlot,
          type: type as VisitType,
          message,
          status: VisitStatus.PENDING,
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
            type: NotificationType.VISIT_BOOKED,
            message: `🗓️ New tour requested by ${user.name} for "${property.title}" on ${tourDate.toLocaleDateString("en-IN")}`,
          },
        });
      }

      return vis;
    });

    return NextResponse.json(
      { message: "Tour requested successfully", visit },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Visit request booking error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred scheduling visit tour" },
      { status: 500 }
    );
  }
}
