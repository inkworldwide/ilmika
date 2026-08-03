import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const callbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  preferredTime: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate Limiting: max 3 callback requests per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`callback_${ip}`, 3, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many callback requests. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);

    const body = await req.json();
    const parsed = callbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, preferredTime } = parsed.data;

    // Verify property and get owner details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true, ownerId: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Create a callback enquiry and notify owner + all admins
    await prisma.$transaction(async (tx) => {
      // Create an enquiry record marked as callback
      await tx.enquiry.create({
        data: {
          propertyId,
          senderId: user?.id || property.ownerId, // fallback if unauthenticated
          name,
          email: user?.email || `${phone}@callback.rentahouse.in`,
          phone,
          message: preferredTime
            ? `📞 Callback Request — Please call me back at ${phone}. Preferred time: ${preferredTime}`
            : `📞 Callback Request — Please call me back at ${phone}.`,
        },
      });

      // Find all Admins
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
            message: `📞 Callback Request from ${name} (${phone}) for "${property.title}"${preferredTime ? ` — Preferred: ${preferredTime}` : ""}`,
          },
        });
      }
    });

    return NextResponse.json(
      { message: "Callback request submitted. Our admin team will contact you shortly." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Callback request error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred processing your callback request" },
      { status: 500 }
    );
  }
}
