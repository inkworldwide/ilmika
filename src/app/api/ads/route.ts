import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page"); // "home", "colleges", "college_detail", "scholarships", "exams", "inner"

    let placementCondition: any = {};
    if (page === "home") {
      placementCondition = { in: ["HOME_ONLY", "BOTH"] };
    } else if (page === "colleges") {
      placementCondition = { in: ["COLLEGES_ONLY", "INNER_ONLY", "BOTH"] };
    } else if (page === "college_detail") {
      placementCondition = { in: ["COLLEGE_DETAIL_ONLY", "INNER_ONLY", "BOTH"] };
    } else if (page === "scholarships") {
      placementCondition = { in: ["SCHOLARSHIPS_ONLY", "INNER_ONLY", "BOTH"] };
    } else if (page === "exams") {
      placementCondition = { in: ["EXAMS_ONLY", "INNER_ONLY", "BOTH"] };
    } else if (page === "inner") {
      placementCondition = { in: ["INNER_ONLY", "COLLEGES_ONLY", "COLLEGE_DETAIL_ONLY", "SCHOLARSHIPS_ONLY", "EXAMS_ONLY", "BOTH"] };
    }

    const ads = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        ...(page && { placement: placementCondition }),
      },
      orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Public ads fetch error:", error);
    return NextResponse.json({ ads: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad ID required" }, { status: 400 });
    }

    await prisma.advertisement.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad click increment error:", error);
    return NextResponse.json({ error: "Failed to log ad click" }, { status: 500 });
  }
}
