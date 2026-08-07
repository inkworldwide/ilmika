import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collegeId } = await params;

    const courses = await prisma.course.findMany({
      where: { collegeId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = courses.map((c) => ({
      ...c,
      annualFees: c.annualFees ? Number(c.annualFees) : 0,
      avgSalary: c.avgSalary ? Number(c.avgSalary) : null,
      highestSalary: c.highestSalary ? Number(c.highestSalary) : null,
    }));

    return NextResponse.json({ courses: formatted });
  } catch (error) {
    console.error("Fetch college courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: collegeId } = await params;
    const body = await req.json();

    const {
      name,
      degree,
      stream,
      durationYears,
      annualFees,
      feeCurrency,
      mode,
      eligibility,
      entranceExams,
      totalSeats,
      scholarshipAvailable,
    } = body;

    if (!name || !degree || !stream || !eligibility) {
      return NextResponse.json(
        { error: "Course name, degree, stream, and eligibility criteria are required" },
        { status: 400 }
      );
    }

    // Convert entranceExams array or comma string
    let examsList: string[] = [];
    if (Array.isArray(entranceExams)) {
      examsList = entranceExams;
    } else if (typeof entranceExams === "string" && entranceExams.trim()) {
      examsList = entranceExams.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const course = await prisma.course.create({
      data: {
        collegeId,
        name,
        degree: degree || "BACHELOR",
        stream: stream || "ENGINEERING",
        durationYears: durationYears ? parseFloat(durationYears) : 4.0,
        annualFees: annualFees ? parseFloat(annualFees) : 0,
        feeCurrency: feeCurrency || "INR",
        mode: mode || "FULL_TIME",
        eligibility,
        entranceExams: examsList,
        totalSeats: totalSeats ? parseInt(totalSeats) : null,
        scholarshipAvailable: Boolean(scholarshipAvailable),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        annualFees: Number(course.annualFees),
      },
    });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      courseId,
      name,
      degree,
      stream,
      durationYears,
      annualFees,
      feeCurrency,
      mode,
      eligibility,
      entranceExams,
      totalSeats,
      scholarshipAvailable,
      isActive,
    } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    let examsList: string[] | undefined = undefined;
    if (Array.isArray(entranceExams)) {
      examsList = entranceExams;
    } else if (typeof entranceExams === "string") {
      examsList = entranceExams.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(name && { name }),
        ...(degree && { degree }),
        ...(stream && { stream }),
        ...(durationYears !== undefined && { durationYears: parseFloat(durationYears) }),
        ...(annualFees !== undefined && { annualFees: parseFloat(annualFees) }),
        ...(feeCurrency && { feeCurrency }),
        ...(mode && { mode }),
        ...(eligibility && { eligibility }),
        ...(examsList !== undefined && { entranceExams: examsList }),
        ...(totalSeats !== undefined && { totalSeats: totalSeats ? parseInt(totalSeats) : null }),
        ...(scholarshipAvailable !== undefined && { scholarshipAvailable: Boolean(scholarshipAvailable) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        annualFees: Number(course.annualFees),
      },
    });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
