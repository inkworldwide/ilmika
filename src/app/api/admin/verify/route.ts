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
      where: {
        status: { in: ["PENDING_VERIFICATION", "DRAFT"] },
      },
      include: {
        city: true,
        country: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error("Verification queue error:", error);
    return NextResponse.json({ error: "Failed to fetch verification queue" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { collegeId, status, rejectionReason } = body;

    if (!collegeId || !status) {
      return NextResponse.json({ error: "College ID and status required" }, { status: 400 });
    }

    const updated = await prisma.college.update({
      where: { id: collegeId },
      data: {
        status,
        isVerified: status === "ACTIVE",
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
      },
    });

    return NextResponse.json({ success: true, college: updated });
  } catch (error) {
    console.error("College verification update error:", error);
    return NextResponse.json({ error: "Failed to update college status" }, { status: 500 });
  }
}
