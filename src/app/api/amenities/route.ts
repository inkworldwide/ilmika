import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ amenities });
  } catch (error: any) {
    console.error("Fetch amenities error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve amenities list" },
      { status: 500 }
    );
  }
}
