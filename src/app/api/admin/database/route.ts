import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const databaseSchema = z.object({
  type: z.enum(["city", "country", "facility"]),
  cityName: z.string().optional(),
  countryId: z.string().optional(),
  countryName: z.string().optional(),
  countryCode: z.string().optional(),
  flag: z.string().optional(),
  facilityName: z.string().optional(),
  icon: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const parsed = databaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, cityName, countryId, countryName, countryCode, flag, facilityName, icon } = parsed.data;

    if (type === "country") {
      if (!countryName || !countryCode) {
        return NextResponse.json({ error: "Country name and code required" }, { status: 400 });
      }
      const country = await prisma.country.create({
        data: {
          name: countryName,
          code: countryCode.toUpperCase(),
          flag: flag || "🌍",
        },
      });
      return NextResponse.json({ message: "Country created successfully", country }, { status: 201 });
    }

    if (type === "city") {
      if (!cityName) return NextResponse.json({ error: "City name is required" }, { status: 400 });
      let targetCountryId = countryId;
      if (!targetCountryId) {
        const defaultCountry = await prisma.country.findFirst();
        targetCountryId = defaultCountry?.id;
      }
      if (!targetCountryId) {
        return NextResponse.json({ error: "Country required" }, { status: 400 });
      }
      const id = cityName.toLowerCase().replace(/\s+/g, "-");
      
      const city = await prisma.city.create({
        data: {
          name: cityName,
          slug: id,
          countryId: targetCountryId,
        },
      });
      return NextResponse.json({ message: "City created successfully", city }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin database post error:", error);
    return NextResponse.json(
      { error: "Failed to create database entry." },
      { status: 500 }
    );
  }
}
