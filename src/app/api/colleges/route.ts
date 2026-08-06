import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const stream = searchParams.get("stream");
    const degree = searchParams.get("degree");
    const mode = searchParams.get("mode");
    const country = searchParams.get("country");
    const cityId = searchParams.get("cityId");
    const collegeType = searchParams.get("collegeType");
    const isVerified = searchParams.get("isVerified") === "true";
    const scholarship = searchParams.get("scholarship") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      status: "ACTIVE",
    };

    const maxFees = searchParams.get("maxFees");

    if (isVerified) where.isVerified = true;
    if (collegeType) where.collegeType = collegeType;
    if (cityId) where.cityId = cityId;

    if (country) {
      where.country = { code: country };
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { city: { name: { contains: q, mode: "insensitive" } } },
        { country: { name: { contains: q, mode: "insensitive" } } },
        { courses: { some: { isActive: true, name: { contains: q, mode: "insensitive" } } } },
      ];
    }

    if (stream || degree || mode || scholarship || maxFees) {
      where.courses = {
        some: {
          isActive: true,
          ...(stream ? { stream: stream as any } : {}),
          ...(degree ? { degree: degree as any } : {}),
          ...(mode ? { mode: mode as any } : {}),
          ...(scholarship ? { scholarshipAvailable: true } : {}),
          ...(maxFees ? { annualFees: { lte: parseFloat(maxFees) } } : {}),
        },
      };
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        include: {
          city: true,
          country: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          accreditations: { take: 2 },
          courses: { where: { isActive: true }, take: 3, orderBy: { annualFees: "asc" } },
          _count: { select: { courses: true, reviews: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.college.count({ where }),
    ]);

    const serialized = colleges.map((c) => ({
      ...c,
      courses: c.courses.map((course) => ({
        ...course,
        annualFees: course.annualFees ? Number(course.annualFees) : 0,
        avgSalary: course.avgSalary ? Number(course.avgSalary) : null,
        highestSalary: course.highestSalary ? Number(course.highestSalary) : null,
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ colleges: serialized, total, page, limit });
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 });
  }
}
