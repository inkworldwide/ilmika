import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let sessions;
    if (user.role === "USER") {
      sessions = await prisma.counsellingSession.findMany({
        where: { studentId: user.id },
        include: {
          college: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { date: "desc" },
      });
    } else {
      sessions = await prisma.counsellingSession.findMany({
        where: { college: { ownerId: user.id } },
        include: {
          college: { select: { id: true, name: true, slug: true } },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: "desc" },
      });
    }

    return NextResponse.json({ visits: sessions, sessions });
  } catch (error) {
    console.error("Dashboard counselling sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch counselling sessions" }, { status: 500 });
  }
}
