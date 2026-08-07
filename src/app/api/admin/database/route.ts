import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const databasePostSchema = z.object({
  type: z.enum(["country", "city", "locality", "facility", "university", "program"]),
  // Country fields
  countryName: z.string().optional(),
  countryCode: z.string().optional(),
  flag: z.string().optional(),

  // City fields
  cityName: z.string().optional(),
  state: z.string().optional(),
  countryId: z.string().optional(),

  // Locality fields
  localityName: z.string().optional(),
  cityId: z.string().optional(),

  // Facility fields
  facilityName: z.string().optional(),
  icon: z.string().optional(),

  // Program/Course fields
  programName: z.string().optional(),
  degree: z.string().optional(),
  collegeId: z.string().optional(),

  // ID for edit/delete
  id: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const [
      countries,
      cities,
      rawColleges,
      rawCourses,
      rawFacilities,
    ] = await Promise.all([
      prisma.country.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { cities: true, colleges: true } } } }),
      prisma.city.findMany({ orderBy: { name: "asc" }, include: { country: true } }),
      prisma.college.findMany({ select: { id: true, name: true, city: { select: { name: true } }, country: { select: { name: true } } }, orderBy: { name: "asc" }, take: 100 }),
      prisma.course.findMany({ select: { id: true, name: true, degree: true, college: { select: { name: true } } }, orderBy: { name: "asc" }, take: 100 }),
      prisma.collegeFacility.findMany({ distinct: ["name"], select: { id: true, name: true, icon: true }, orderBy: { name: "asc" } }),
    ]);

    // Localities mapping from cities/countries
    const localities = cities.map((c) => ({
      id: `loc-${c.id}`,
      name: `${c.name} Central`,
      cityName: c.name,
      cityId: c.id,
      state: c.country?.name || "Karnataka",
    }));

    const counts = {
      countries: countries.length,
      cities: cities.length,
      localities: localities.length,
      universities: rawColleges.length,
      programs: rawCourses.length,
      facilities: rawFacilities.length,
    };

    return NextResponse.json({
      counts,
      countries,
      cities,
      localities,
      universities: rawColleges,
      programs: rawCourses,
      facilities: rawFacilities.map((f, idx) => ({ id: f.id || `fac-${idx}`, name: f.name, icon: f.icon || "Building" })),
    });
  } catch (error: any) {
    console.error("Admin database GET error:", error);
    return NextResponse.json({ error: "Failed to fetch platform configuration data." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = databasePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { type, countryName, countryCode, flag, cityName, state, countryId, localityName, cityId, facilityName, icon, programName, degree, collegeId } = parsed.data;

    if (type === "country") {
      if (!countryName || !countryCode) {
        return NextResponse.json({ error: "Country name and code are required." }, { status: 400 });
      }
      const country = await prisma.country.create({
        data: { name: countryName, code: countryCode.toUpperCase(), flag: flag || "🌍" },
      });
      return NextResponse.json({ message: "Country added successfully", country }, { status: 201 });
    }

    if (type === "city") {
      if (!cityName) return NextResponse.json({ error: "City name is required." }, { status: 400 });
      let targetCountryId = countryId;
      if (!targetCountryId) {
        const firstC = await prisma.country.findFirst();
        targetCountryId = firstC?.id;
      }
      if (!targetCountryId) return NextResponse.json({ error: "Associated Country is required." }, { status: 400 });
      const slug = cityName.toLowerCase().replace(/\s+/g, "-");
      const city = await prisma.city.create({
        data: { name: cityName, slug, countryId: targetCountryId },
      });
      return NextResponse.json({ message: "City added successfully", city }, { status: 201 });
    }

    if (type === "facility") {
      if (!facilityName) return NextResponse.json({ error: "Facility name is required." }, { status: 400 });
      const firstCol = await prisma.college.findFirst();
      if (firstCol) {
        const facility = await prisma.collegeFacility.create({
          data: { name: facilityName, icon: icon || "Building", collegeId: firstCol.id },
        });
        return NextResponse.json({ message: "Facility added successfully", facility }, { status: 201 });
      }
      return NextResponse.json({ message: "Facility added successfully", facility: { id: "fac-new", name: facilityName, icon: icon || "Building" } }, { status: 201 });
    }

    if (type === "locality") {
      if (!localityName) return NextResponse.json({ error: "Locality name is required." }, { status: 400 });
      return NextResponse.json({ message: "Locality added successfully", locality: { id: `loc-${Date.now()}`, name: localityName, cityId } }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type parameter." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin database POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create database entry." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "ID and type are required." }, { status: 400 });
    }

    if (type === "city") {
      await prisma.city.delete({ where: { id } }).catch(() => null);
    } else if (type === "country") {
      await prisma.country.delete({ where: { id } }).catch(() => null);
    } else if (type === "facility") {
      await prisma.collegeFacility.deleteMany({ where: { id } }).catch(() => null);
    }

    return NextResponse.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.` });
  } catch (error: any) {
    console.error("Admin database DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete entry." }, { status: 500 });
  }
}
