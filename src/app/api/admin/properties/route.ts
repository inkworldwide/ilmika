import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { PropertyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    const whereClause: any = {};
    if (ownerId) {
      whereClause.ownerId = ownerId;
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        images: { take: 1 },
        city: { select: { name: true } },
        locality: { select: { name: true } },
        owner: { select: { customId: true, name: true, role: true } }
      },
      orderBy: { updatedAt: "desc" },
    });

    const active = properties.filter(p => p.status !== PropertyStatus.ARCHIVED).map(p => ({
      ...p,
      price: parseFloat(p.price.toString()),
    }));

    const archived = properties.filter(p => p.status === PropertyStatus.ARCHIVED).map(p => ({
      ...p,
      price: parseFloat(p.price.toString()),
    }));

    return NextResponse.json({ active, archived });
  } catch (error: any) {
    console.error("Admin fetch properties error:", error);
    return NextResponse.json({ error: "Failed to fetch admin properties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action, reason } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    if (action === "archive") {
      const updated = await prisma.property.update({
        where: { id },
        data: {
          status: PropertyStatus.ARCHIVED,
          rejectionReason: reason || "Archived by Admin",
        },
      });
      return NextResponse.json({ message: "Property archived successfully", property: updated });
    }

    if (action === "restore") {
      const updated = await prisma.property.update({
        where: { id },
        data: {
          status: PropertyStatus.ACTIVE,
          rejectionReason: null,
        },
      });
      return NextResponse.json({ message: "Property restored successfully", property: updated });
    }

    if (action === "delete") {
      await prisma.property.delete({
        where: { id },
      });
      return NextResponse.json({ message: "Property permanently deleted" });
    }

    if (action === "toggleFeatured") {
      const prop = await prisma.property.findUnique({ where: { id } });
      if (!prop) return NextResponse.json({ error: "Property not found" }, { status: 404 });
      const updated = await prisma.property.update({
        where: { id },
        data: {
          isFeatured: !prop.isFeatured,
        },
      });
      return NextResponse.json({ message: "Featured status updated", property: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin action properties error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
