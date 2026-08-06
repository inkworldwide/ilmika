import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [
      totalUsers,
      totalColleges,
      pendingVerifications,
      activeColleges,
      totalApplications,
      totalEnquiries,
      totalReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.college.count(),
      prisma.college.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.college.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.collegeEnquiry.count(),
      prisma.collegeReport.count(),
    ]);

    return NextResponse.json({
      summary: {
        totalUsers,
        totalColleges,
        pendingVerifications,
        activeColleges,
        totalApplications,
        totalEnquiries,
        totalReports,
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to load admin analytics" }, { status: 500 });
  }
}
