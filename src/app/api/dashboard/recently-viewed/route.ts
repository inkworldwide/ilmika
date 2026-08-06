import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      include: {
        college: {
          include: {
            city: true,
            country: true,
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            courses: { where: { isActive: true }, take: 2 },
          },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 12,
    });

    const colleges = recentlyViewed.map((rv) => ({
      ...rv.college,
      courses: rv.college.courses.map((c) => ({
        ...c,
        annualFees: c.annualFees ? Number(c.annualFees) : 0,
      })),
    }));

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error("Dashboard recently-viewed error:", error);
    return NextResponse.json({ error: "Failed to fetch recently viewed" }, { status: 500 });
  }
}
