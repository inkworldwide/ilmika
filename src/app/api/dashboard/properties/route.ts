import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role === "USER") {
      return NextResponse.json(
        { error: "Access denied. Student profiles cannot host college listings." },
        { status: 403 }
      );
    }

    // Fetch colleges owned by user, or all if ADMIN and no personal owned colleges
    let colleges = await prisma.college.findMany({
      where: user.role === "ADMIN" ? {} : { ownerId: user.id },
      include: {
        city: true,
        country: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        courses: { where: { isActive: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = colleges.map(c => ({
      ...c,
      courses: c.courses.map(course => ({
        ...course,
        annualFees: course.annualFees ? Number(course.annualFees) : 0,
      })),
    }));

    return NextResponse.json({ colleges: formatted, properties: formatted });
  } catch (error: any) {
    console.error("Dashboard colleges fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch owned college listings" },
      { status: 500 }
    );
  }
}
