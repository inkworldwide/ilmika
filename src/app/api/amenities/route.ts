import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const facilities = await prisma.collegeFacility.findMany({
      distinct: ["name"],
      select: { name: true, icon: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ amenities: facilities, facilities });
  } catch (error: any) {
    console.error("Fetch facilities error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve facilities list" },
      { status: 500 }
    );
  }
}
