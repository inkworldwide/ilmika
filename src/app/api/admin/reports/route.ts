import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET - Retrieve all property reports (Admin Only)
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const reports = await prisma.propertyReport.findMany({
      include: {
        property: {
          select: {
            id: true,
            title: true,
            status: true,
            ownerId: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Fetch admin reports error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve property reports" },
      { status: 500 }
    );
  }
}

// DELETE - Dismiss/Delete a report (Admin Only)
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required." },
        { status: 400 }
      );
    }

    await prisma.propertyReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ message: "Report dismissed successfully" });
  } catch (error: any) {
    console.error("Delete admin report error:", error);
    return NextResponse.json(
      { error: "Failed to dismiss report" },
      { status: 500 }
    );
  }
}
