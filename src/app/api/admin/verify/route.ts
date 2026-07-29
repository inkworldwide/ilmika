import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NotificationType, PropertyStatus } from "@prisma/client";

const verifySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  status: z.enum(["ACTIVE", "REJECTED"]),
  rejectionReason: z.string().optional().nullable(),
});

// GET - Retrieve properties waiting in verification queue
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const properties = await prisma.property.findMany({
      where: { status: "PENDING_VERIFICATION" },
      include: {
        city: true,
        locality: true,
        images: { take: 1 },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = properties.map(p => ({
      ...p,
      price: parseFloat(p.price.toString()),
    }));

    return NextResponse.json({ properties: formatted });
  } catch (error: any) {
    console.error("Fetch pending verification listings error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve pending listings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { propertyId, status, rejectionReason } = parsed.data;

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Execute atomic transaction updating status and owner notifications
    const updatedProperty = await prisma.$transaction(async (tx) => {
      // 1. Update Property Status
      const prop = await tx.property.update({
        where: { id: propertyId },
        data: {
          status: status as PropertyStatus,
          rejectionReason: status === "REJECTED" ? rejectionReason : null,
        },
      });

      // 2. Create Notification for Owner
      let type: NotificationType = NotificationType.PROPERTY_APPROVED;
      let msg = `Congratulations! Your property listing: "${property.title}" has been verified and is now ACTIVE.`;

      if (status === "REJECTED") {
        type = NotificationType.PROPERTY_REJECTED;
        msg = `Your property listing: "${property.title}" was declined by the administrator. Reason: ${rejectionReason || "Listing data incomplete."}`;
      }

      await tx.notification.create({
        data: {
          userId: property.ownerId,
          type,
          message: msg,
        },
      });

      return prop;
    });

    return NextResponse.json({
      message: `Property status updated to ${status} successfully`,
      property: updatedProperty,
    });
  } catch (error: any) {
    console.error("Admin verification API error:", error);
    return NextResponse.json(
      { error: "Failed to process property verification request" },
      { status: 500 }
    );
  }
}
