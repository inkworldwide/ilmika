import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role === "USER") {
      return NextResponse.json(
        { error: "Access denied. seeker profiles cannot host listings." },
        { status: 403 }
      );
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format Decimal values
    const formatted = properties.map(p => ({
      ...p,
      price: parseFloat(p.price.toString()),
      monthlyRent: p.monthlyRent ? parseFloat(p.monthlyRent.toString()) : null,
      securityDeposit: p.securityDeposit ? parseFloat(p.securityDeposit.toString()) : null,
      maintenanceCharges: p.maintenanceCharges ? parseFloat(p.maintenanceCharges.toString()) : null,
    }));

    return NextResponse.json({ properties: formatted });
  } catch (error: any) {
    console.error("Dashboard properties fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch owned listings" },
      { status: 500 }
    );
  }
}
