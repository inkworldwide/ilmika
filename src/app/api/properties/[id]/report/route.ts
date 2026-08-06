import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collegeId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { reason, details } = body;

    const report = await prisma.collegeReport.create({
      data: {
        collegeId,
        reporterId: user.id,
        reason: reason || "OTHER",
        details: details || "Report submitted",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: "Failed to report college" }, { status: 500 });
  }
}
