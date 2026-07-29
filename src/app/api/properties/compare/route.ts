import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";
    
    if (!idsParam.trim()) {
      return NextResponse.json({ properties: [] });
    }

    const ids = idsParam.split(",").filter(Boolean);

    const properties = await prisma.property.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        city: true,
        locality: true,
        images: {
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    // Format Decimal values
    const formatted = properties.map((p) => ({
      ...p,
      price: parseFloat(p.price.toString()),
      monthlyRent: p.monthlyRent ? parseFloat(p.monthlyRent.toString()) : null,
      securityDeposit: p.securityDeposit ? parseFloat(p.securityDeposit.toString()) : null,
      maintenanceCharges: p.maintenanceCharges ? parseFloat(p.maintenanceCharges.toString()) : null,
    }));

    return NextResponse.json({ properties: formatted });
  } catch (error: any) {
    console.error("Comparison API error:", error);
    return NextResponse.json(
      { error: "Failed to load properties for comparison" },
      { status: 500 }
    );
  }
}
