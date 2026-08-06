import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const colleges = await prisma.college.findMany({
      where: { status: "ACTIVE" },
      include: {
        city: true,
        country: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        courses: { where: { isActive: true }, take: 2 },
      },
      take: 12,
    });

    const serialized = colleges.map((c) => ({
      ...c,
      courses: c.courses.map((course) => ({
        ...course,
        annualFees: course.annualFees ? Number(course.annualFees) : 0,
      })),
    }));

    return NextResponse.json({ properties: serialized, colleges: serialized, meta: { total: colleges.length } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ error: "Please use /api/colleges/create to submit a college listing." }, { status: 400 });
}
