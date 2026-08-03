import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { EnquiryStatus, VisitStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    // Fetch all enquiries with property & sender details
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            transactionType: true,
            price: true,
            city: { select: { name: true } },
            locality: { select: { name: true } },
          },
        },
        sender: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Fetch all tour visits
    const visits = await prisma.visit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            transactionType: true,
            city: { select: { name: true } },
            locality: { select: { name: true } },
          },
        },
        visitor: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Fetch all admin alert notifications (custom seeker requirements / contact requests)
    const adminAlerts = await prisma.notification.findMany({
      where: {
        type: "ADMIN_ALERT",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      enquiries,
      visits,
      adminAlerts,
    });
  } catch (error: any) {
    console.error("Admin inquiries GET error:", error);
    return NextResponse.json({ error: "Failed to fetch admin inquiries." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { target, id, status } = body;

    if (target === "enquiry") {
      const updated = await prisma.enquiry.update({
        where: { id },
        data: { status: status as EnquiryStatus },
      });
      return NextResponse.json({ success: true, updated });
    }

    if (target === "visit") {
      const updated = await prisma.visit.update({
        where: { id },
        data: { status: status as VisitStatus },
      });
      return NextResponse.json({ success: true, updated });
    }

    if (target === "alert") {
      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: "Invalid target specified" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin inquiries PUT error:", error);
    return NextResponse.json({ error: "Failed to update inquiry status." }, { status: 500 });
  }
}
