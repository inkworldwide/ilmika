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

    const favourites = await prisma.favourite.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const properties = favourites.map(f => ({
      ...f.property,
      price: parseFloat(f.property.price.toString()),
      monthlyRent: f.property.monthlyRent ? parseFloat(f.property.monthlyRent.toString()) : null,
      securityDeposit: f.property.securityDeposit ? parseFloat(f.property.securityDeposit.toString()) : null,
      maintenanceCharges: f.property.maintenanceCharges ? parseFloat(f.property.maintenanceCharges.toString()) : null,
    }));

    return NextResponse.json({ properties });
  } catch (error: any) {
    console.error("Dashboard saved listings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved listings" },
      { status: 500 }
    );
  }
}
