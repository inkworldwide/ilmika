import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [enquiries, applications, counsellingSessions] = await Promise.all([
      prisma.collegeEnquiry.findMany({
        include: {
          college: { select: { id: true, name: true, slug: true } },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        include: {
          college: { select: { id: true, name: true, slug: true } },
          course: { select: { id: true, name: true } },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.counsellingSession.findMany({
        include: {
          college: { select: { id: true, name: true, slug: true } },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ enquiries, applications, counsellingSessions });
  } catch (error) {
    console.error("Admin enquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { target, id, status, remarks } = await req.json();

    let targetUserId: string | null = null;
    let notificationMsg = "";
    let notifType: "APPLICATION_REVIEWED" | "ENQUIRY_RECEIVED" | "SESSION_CONFIRMED" | "SESSION_REJECTED" | "ADMIN_ALERT" = "ADMIN_ALERT";

    if (target === "enquiry") {
      const updated = await prisma.collegeEnquiry.update({
        where: { id },
        data: { status },
        include: { college: true, student: true },
      });

      targetUserId = updated.studentId || null;
      if (!targetUserId && updated.email) {
        const u = await prisma.user.findFirst({ where: { email: updated.email } });
        if (u) targetUserId = u.id;
      }

      const collegeName = updated.college?.name || "College";
      notifType = "ENQUIRY_RECEIVED";
      notificationMsg = `Your enquiry regarding ${collegeName} has been updated to "${status}".${remarks ? ` Note: ${remarks}` : ""}`;
    } else if (target === "application") {
      const updated = await prisma.application.update({
        where: { id },
        data: { status },
        include: { college: true, course: true, student: true },
      });

      targetUserId = updated.studentId || null;
      if (!targetUserId && updated.email) {
        const u = await prisma.user.findFirst({ where: { email: updated.email } });
        if (u) targetUserId = u.id;
      }

      const collegeName = updated.college?.name || "College";
      const courseName = updated.course?.name || "Course";
      notifType = "APPLICATION_REVIEWED";

      if (status === "ACCEPTED") {
        notificationMsg = `🎉 Great News! Your application for ${courseName} at ${collegeName} has been ACCEPTED!${remarks ? ` Note: ${remarks}` : ""}`;
      } else if (status === "REJECTED") {
        notificationMsg = `Your application for ${courseName} at ${collegeName} has been REJECTED.${remarks ? ` Reason: ${remarks}` : ""}`;
      } else {
        notificationMsg = `Your application for ${courseName} at ${collegeName} status is now "${status}".${remarks ? ` Note: ${remarks}` : ""}`;
      }
    } else if (target === "counselling") {
      const updated = await prisma.counsellingSession.update({
        where: { id },
        data: { status },
        include: { college: true, student: true },
      });

      targetUserId = updated.studentId || null;
      if (!targetUserId && updated.email) {
        const u = await prisma.user.findFirst({ where: { email: updated.email } });
        if (u) targetUserId = u.id;
      }

      const collegeName = updated.college?.name || "College";
      notifType = status === "CONFIRMED" ? "SESSION_CONFIRMED" : status === "REJECTED" ? "SESSION_REJECTED" : "ADMIN_ALERT";
      notificationMsg = `Your counselling session request for ${collegeName} has been updated to "${status}".${remarks ? ` Note: ${remarks}` : ""}`;
    }

    if (targetUserId && notificationMsg) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: notifType,
          message: notificationMsg,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target");
    const id = searchParams.get("id");

    if (!target || !id) {
      return NextResponse.json({ error: "Target and ID required" }, { status: 400 });
    }

    if (target === "enquiry") {
      await prisma.collegeEnquiry.delete({ where: { id } });
    } else if (target === "application") {
      await prisma.application.delete({ where: { id } });
    } else if (target === "counselling") {
      await prisma.counsellingSession.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
