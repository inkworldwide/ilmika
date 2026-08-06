import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";
    
    if (!idsParam.trim()) {
      return NextResponse.json({ colleges: [], properties: [] });
    }

    const ids = idsParam.split(",").filter(Boolean);

    const colleges = await prisma.college.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        city: true,
        country: true,
        images: {
          take: 1,
          orderBy: { sortOrder: "asc" },
        },
        courses: { where: { isActive: true } },
        facilities: true,
        accreditations: true,
      },
    });

    const formatted = colleges.map((c) => ({
      ...c,
      courses: c.courses.map((course) => ({
        ...course,
        annualFees: course.annualFees ? Number(course.annualFees) : 0,
      })),
    }));

    return NextResponse.json({ colleges: formatted, properties: formatted });
  } catch (error: any) {
    console.error("College comparison API error:", error);
    return NextResponse.json(
      { error: "Failed to load colleges for comparison" },
      { status: 500 }
    );
  }
}
