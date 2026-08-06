import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const colleges = await prisma.college.findMany({
      where: { ownerId: user.id },
      select: { id: true, viewCount: true, status: true },
    });

    const totalColleges = colleges.length;
    const activeColleges = colleges.filter((c) => c.status === "ACTIVE").length;
    const totalViews = colleges.reduce((sum, c) => sum + (c.viewCount || 0), 0);

    const enquiriesCount = await prisma.collegeEnquiry.count({
      where: { college: { ownerId: user.id } },
    });

    const applicationsCount = await prisma.application.count({
      where: { college: { ownerId: user.id } },
    });

    return NextResponse.json({
      summary: {
        totalColleges,
        activeColleges,
        totalViews,
        enquiriesCount,
        applicationsCount,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
