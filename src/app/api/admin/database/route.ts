import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const databaseSchema = z.object({
  type: z.enum(["city", "locality", "amenity"]),
  // City values
  cityName: z.string().optional(),
  state: z.string().optional(),
  // Locality values
  localityName: z.string().optional(),
  cityId: z.string().optional(),
  // Amenity values
  amenityName: z.string().optional(),
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

    // Validate inputs
    const parsed = databaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, cityName, state, localityName, cityId, amenityName, icon } = parsed.data;

    if (type === "city") {
      if (!cityName) return NextResponse.json({ error: "City name is required" }, { status: 400 });
      const id = cityName.toLowerCase().replace(/\s+/g, "-");
      
      const city = await prisma.city.create({
        data: {
          id,
          name: cityName,
          slug: id,
        },
      });
      return NextResponse.json({ message: "City created successfully", city }, { status: 201 });
    }

    if (type === "locality") {
      if (!localityName || !cityId) {
        return NextResponse.json({ error: "Locality name and City ID are required" }, { status: 400 });
      }
      const id = localityName.toLowerCase().replace(/\s+/g, "-");
      
      const locality = await prisma.locality.create({
        data: {
          id,
          name: localityName,
          slug: id,
          cityId,
        },
      });
      return NextResponse.json({ message: "Locality created successfully", locality }, { status: 201 });
    }

    if (type === "amenity") {
      if (!amenityName) return NextResponse.json({ error: "Amenity name is required" }, { status: 400 });
      const id = amenityName.toLowerCase().replace(/\s+/g, "-");
      
      const amenity = await prisma.amenity.create({
        data: {
          id,
          name: amenityName,
          icon: icon || "Check",
        },
      });
      return NextResponse.json({ message: "Amenity created successfully", amenity }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin database post error:", error);
    return NextResponse.json(
      { error: "Failed to create database entry. Record might already exist." },
      { status: 500 }
    );
  }
}
