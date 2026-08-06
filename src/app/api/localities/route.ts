import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ localities: countries, countries });
  } catch (error) {
    console.error("Fetch localities API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch localities" },
      { status: 500 }
    );
  }
}
