import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        city: true,
        country: true,
        images: { orderBy: { sortOrder: "asc" } },
        courses: { where: { isActive: true } },
        accreditations: true,
        facilities: true,
        reviews: true,
      },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const serialized = {
      ...college,
      courses: college.courses.map((c) => ({
        ...c,
        annualFees: c.annualFees ? Number(c.annualFees) : 0,
      })),
    };

    return NextResponse.json({ property: serialized, college: serialized });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to retrieve college details" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.college.delete({ where: { id } });
    return NextResponse.json({ message: "College deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete college" }, { status: 500 });
  }
}
