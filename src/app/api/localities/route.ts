import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ countries });
  } catch (error) {
    console.error("Fetch countries API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
