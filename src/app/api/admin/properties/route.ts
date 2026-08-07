import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const colleges = await prisma.college.findMany({
      include: {
        city: true,
        country: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const active = colleges.filter((c) => c.status !== "ARCHIVED");
    const archived = colleges.filter((c) => c.status === "ARCHIVED");

    return NextResponse.json({ colleges, active, archived });
  } catch (error) {
    console.error("Admin colleges fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { collegeId, action, isFeatured } = body;

    if (!collegeId) {
      return NextResponse.json({ error: "College ID is required" }, { status: 400 });
    }

    if (action === "archive" || action === "delete") {
      const updated = await prisma.college.update({
        where: { id: collegeId },
        data: { status: "ARCHIVED" },
      });
      return NextResponse.json({ message: "College archived successfully", college: updated });
    }

    if (action === "restore") {
      const updated = await prisma.college.update({
        where: { id: collegeId },
        data: { status: "ACTIVE" },
      });
      return NextResponse.json({ message: "College restored successfully", college: updated });
    }

    if (action === "toggleFeatured") {
      const col = await prisma.college.findUnique({ where: { id: collegeId } });
      if (!col) return NextResponse.json({ error: "College not found" }, { status: 404 });
      const updated = await prisma.college.update({
        where: { id: collegeId },
        data: { isFeatured: !col.isFeatured },
      });
      return NextResponse.json({ message: "Featured status updated", college: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin college update error:", error);
    return NextResponse.json({ error: "Failed to update college" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");
    const permanent = searchParams.get("permanent") === "true";

    if (!collegeId) {
      return NextResponse.json({ error: "College ID required" }, { status: 400 });
    }

    if (permanent) {
      await prisma.college.delete({
        where: { id: collegeId },
      });
      return NextResponse.json({ message: "College permanently deleted" });
    }

    // Soft delete by setting ARCHIVED status so it can be restored
    const updated = await prisma.college.update({
      where: { id: collegeId },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ message: "College deleted successfully", college: updated });
  } catch (error) {
    console.error("Admin college delete error:", error);
    return NextResponse.json({ error: "Failed to delete college" }, { status: 500 });
  }
}
