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
        { error: "Access denied. Analytics is only available to owners, agents, and admins." },
        { status: 403 }
      );
    }

    // Filters properties owned by the current user (if not ADMIN)
    const isGlobal = user.role === "ADMIN";
    const propertyOwnerFilter = isGlobal ? {} : { ownerId: user.id };

    // Query Metrics in Parallel
    const [
      totalProperties,
      activeProperties,
      pendingProperties,
      draftProperties,
      rentProperties,
      saleProperties,
      leaseProperties,
      enquiriesCount,
      visitsCount,
      propertiesList,
    ] = await Promise.all([
      prisma.property.count({ where: propertyOwnerFilter }),
      prisma.property.count({ where: { ...propertyOwnerFilter, status: "ACTIVE" } }),
      prisma.property.count({ where: { ...propertyOwnerFilter, status: "PENDING_VERIFICATION" } }),
      prisma.property.count({ where: { ...propertyOwnerFilter, status: "DRAFT" } }),
      prisma.property.count({ where: { ...propertyOwnerFilter, transactionType: "RENT" } }),
      prisma.property.count({ where: { ...propertyOwnerFilter, transactionType: "SALE" } }),
      prisma.property.count({ where: { ...propertyOwnerFilter, transactionType: "LEASE" } }),
      prisma.enquiry.count({
        where: isGlobal ? {} : { property: { ownerId: user.id } },
      }),
      prisma.visit.count({
        where: isGlobal ? {} : { property: { ownerId: user.id } },
      }),
      prisma.property.findMany({
        where: propertyOwnerFilter,
        select: {
          id: true,
          title: true,
          viewCount: true,
          _count: {
            select: {
              enquiries: true,
              visits: true,
            },
          },
        },
        orderBy: { viewCount: "desc" },
        take: 5,
      }),
    ]);

    // Calculate total view counts
    const viewsAggregate = await prisma.property.aggregate({
      where: propertyOwnerFilter,
      _sum: {
        viewCount: true,
      },
    });
    const totalViews = viewsAggregate._sum.viewCount || 0;

    // Format top performing properties details for chart visualization
    const topProperties = propertiesList.map(p => ({
      title: p.title.length > 25 ? p.title.substring(0, 25) + "..." : p.title,
      views: p.viewCount,
      enquiries: p._count.enquiries,
      visits: p._count.visits,
    }));

    // Mock monthly trends for charts (simulating last 6 months)
    const monthlyTrends = [
      { month: "Feb", views: Math.round(totalViews * 0.1), leads: Math.round(enquiriesCount * 0.1) },
      { month: "Mar", views: Math.round(totalViews * 0.12), leads: Math.round(enquiriesCount * 0.08) },
      { month: "Apr", views: Math.round(totalViews * 0.18), leads: Math.round(enquiriesCount * 0.15) },
      { month: "May", views: Math.round(totalViews * 0.22), leads: Math.round(enquiriesCount * 0.25) },
      { month: "Jun", views: Math.round(totalViews * 0.25), leads: Math.round(enquiriesCount * 0.22) },
      { month: "Jul", views: Math.round(totalViews * 0.3), leads: Math.round(enquiriesCount * 0.3) },
    ];

    return NextResponse.json({
      summary: {
        totalProperties,
        activeProperties,
        pendingProperties,
        draftProperties,
        rentProperties,
        saleProperties,
        leaseProperties,
        enquiriesCount,
        visitsCount,
        totalViews,
      },
      topProperties,
      monthlyTrends,
    });
  } catch (error: any) {
    console.error("Dashboard analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics metrics" },
      { status: 500 }
    );
  }
}
