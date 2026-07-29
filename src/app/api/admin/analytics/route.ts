import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalProperties,
      draftCount,
      pendingCount,
      activeCount,
      enquiriesCount,
      visitsCount,
      reportsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: "DRAFT" } }),
      prisma.property.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.enquiry.count(),
      prisma.visit.count(),
      prisma.propertyReport.count(),
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalProperties,
        draftCount,
        pendingCount,
        activeCount,
        enquiriesCount,
        visitsCount,
        reportsCount,
      },
    });
  } catch (error: any) {
    console.error("Fetch admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics metrics" },
      { status: 500 }
    );
  }
}
