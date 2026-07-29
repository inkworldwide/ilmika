import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");

    const where: any = {};
    if (cityId) {
      where.cityId = cityId;
    }

    const localities = await prisma.locality.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ localities });
  } catch (error) {
    console.error("Fetch localities API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch localities" },
      { status: 500 }
    );
  }
}
