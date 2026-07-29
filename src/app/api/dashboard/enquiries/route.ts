import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { EnquiryStatus } from "@prisma/client";

// GET - Retrieve sent or received enquiries
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
      // Sent enquiries
      const enquiries = await prisma.enquiry.findMany({
        where: { senderId: user.id },
        include: {
          property: {
            select: { id: true, title: true, price: true, transactionType: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = enquiries.map(e => ({
        ...e,
        property: {
          ...e.property,
          price: parseFloat(e.property.price.toString()),
        },
      }));

      return NextResponse.json({ enquiries: formatted });
    } else {
      // Received enquiries (for owners/agents)
      const enquiries = await prisma.enquiry.findMany({
        where: {
          property: { ownerId: user.id },
        },
        include: {
          property: {
            select: { id: true, title: true, price: true, transactionType: true },
          },
          sender: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = enquiries.map(e => ({
        ...e,
        property: {
          ...e.property,
          price: parseFloat(e.property.price.toString()),
        },
      }));

      return NextResponse.json({ enquiries: formatted });
    }
  } catch (error: any) {
    console.error("Dashboard enquiries fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

// PUT - Update Enquiry Status
export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const enquiryId = searchParams.get("id");
    
    const body = await req.json();
    const { status } = body;

    if (!enquiryId || !status) {
      return NextResponse.json(
        { error: "Enquiry ID and Status are required." },
        { status: 400 }
      );
    }

    // Verify enquiry exists and user owns the property
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { property: true },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const isOwner = enquiry.property.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied. You do not own this property." },
        { status: 403 }
      );
    }

    // Update status
    const updated = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status: status as EnquiryStatus },
    });

    return NextResponse.json({
      message: "Enquiry status updated successfully",
      enquiry: updated,
    });
  } catch (error: any) {
    console.error("Update enquiry status error:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry status" },
      { status: 500 }
    );
  }
}
