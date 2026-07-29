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

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: {
            city: true,
            locality: true,
            images: {
              take: 1,
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 12, // Capped at latest 12
    });

    const properties = recentlyViewed.map(rv => ({
      ...rv.property,
      price: parseFloat(rv.property.price.toString()),
      monthlyRent: rv.property.monthlyRent ? parseFloat(rv.property.monthlyRent.toString()) : null,
      securityDeposit: rv.property.securityDeposit ? parseFloat(rv.property.securityDeposit.toString()) : null,
      maintenanceCharges: rv.property.maintenanceCharges ? parseFloat(rv.property.maintenanceCharges.toString()) : null,
    }));

    return NextResponse.json({ properties });
  } catch (error: any) {
    console.error("Dashboard recently viewed fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently viewed properties" },
      { status: 500 }
    );
  }
}
