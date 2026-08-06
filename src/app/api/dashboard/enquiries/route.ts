import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let enquiries;
    if (user.role === "USER") {
      enquiries = await prisma.collegeEnquiry.findMany({
        where: { studentId: user.id },
        include: {
          college: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      enquiries = await prisma.collegeEnquiry.findMany({
        where: { college: { ownerId: user.id } },
        include: {
          college: { select: { id: true, name: true, slug: true } },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Dashboard enquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
