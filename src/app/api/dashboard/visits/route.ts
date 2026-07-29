import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { VisitStatus, NotificationType } from "@prisma/client";

const visitUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"]),
  date: z.string().optional().nullable(),
  timeSlot: z.string().optional().nullable(),
});

// GET - Retrieve sent or received visit tours
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role === "USER") {
      // Tours booked by the user
      const visits = await prisma.visit.findMany({
        where: { visitorId: user.id },
        include: {
          property: {
            select: { id: true, title: true, price: true, transactionType: true },
          },
        },
        orderBy: { date: "asc" },
      });

      const formatted = visits.map(v => ({
        ...v,
        property: {
          ...v.property,
          price: parseFloat(v.property.price.toString()),
        },
      }));

      return NextResponse.json({ visits: formatted });
    } else {
      // Tours received by the owner/agent
      const visits = await prisma.visit.findMany({
        where: {
          property: { ownerId: user.id },
        },
        include: {
          property: {
            select: { id: true, title: true, price: true, transactionType: true },
          },
          visitor: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { date: "asc" },
      });

      const formatted = visits.map(v => ({
        ...v,
        property: {
          ...v.property,
          price: parseFloat(v.property.price.toString()),
        },
      }));

      return NextResponse.json({ visits: formatted });
    }
  } catch (error: any) {
    console.error("Dashboard visits fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit requests" },
      { status: 500 }
    );
  }
}

// PUT - Update Visit status or reschedule
export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("id");
    
    if (!visitId) {
      return NextResponse.json({ error: "Visit ID is required." }, { status: 400 });
    }

    const body = await req.json();

    // Validate inputs
    const parsed = visitUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status, date, timeSlot } = parsed.data;

    // Retrieve the visit details
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { property: true, visitor: true },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visit request not found" }, { status: 404 });
    }

    const isOwner = visit.property.ownerId === user.id;
    const isVisitor = visit.visitorId === user.id;
    const isAdmin = user.role === "ADMIN";

    // Access control: only owner/admin can confirm/reject/reschedule. Visitor can only cancel.
    if (!isOwner && !isVisitor && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Unauthorized to modify this booking." },
        { status: 403 }
      );
    }

    if (status === "CANCELLED" && !isVisitor && !isAdmin && !isOwner) {
      return NextResponse.json({ error: "Only participants can cancel this tour." }, { status: 403 });
    }

    if ((status === "CONFIRMED" || status === "REJECTED" || status === "COMPLETED") && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Only owners or admins can approve/complete tours." }, { status: 403 });
    }

    // Atomic transaction for updating Visit and Notification
    const updatedVisit = await prisma.$transaction(async (tx) => {
      const updateData: any = { status: status as VisitStatus };

      // Rescheduling data
      let isRescheduled = false;
      if (date) {
        const tourDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (tourDate < today) {
          throw new Error("Cannot reschedule to a date in the past.");
        }
        updateData.date = tourDate;
        isRescheduled = true;
      }
      if (timeSlot) {
        updateData.timeSlot = timeSlot;
        isRescheduled = true;
      }

      const updated = await tx.visit.update({
        where: { id: visitId },
        data: updateData,
      });

      if (isVisitor && status === "CANCELLED") {
        // Notify owner
        await tx.notification.create({
          data: {
            userId: visit.property.ownerId,
            type: NotificationType.VISIT_REJECTED,
            message: `${visit.visitor.name} has cancelled their scheduled tour for your property: "${visit.property.title}"`,
          },
        });
      } else if (isOwner || isAdmin) {
        // Notify visitor
        let type: NotificationType = NotificationType.VISIT_RESCHEDULED;
        let message = `Your tour request for "${visit.property.title}" has been updated to ${status}.`;

        if (status === "CONFIRMED") {
          type = NotificationType.VISIT_CONFIRMED;
          message = `Congratulations! Your tour request for "${visit.property.title}" has been CONFIRMED by the owner for ${new Date(updated.date).toLocaleDateString("en-IN")} at ${updated.timeSlot}.`;
        } else if (status === "REJECTED") {
          type = NotificationType.VISIT_REJECTED;
          message = `Your tour request for "${visit.property.title}" has been declined by the owner.`;
        } else if (isRescheduled) {
          type = NotificationType.VISIT_RESCHEDULED;
          message = `The owner has rescheduled your tour for "${visit.property.title}" to ${new Date(updated.date).toLocaleDateString("en-IN")} at ${updated.timeSlot}. Please check details.`;
        }

        await tx.notification.create({
          data: {
            userId: visit.visitorId,
            type,
            message,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      message: "Visit request updated successfully",
      visit: updatedVisit,
    });
  } catch (error: any) {
    console.error("Update visit request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update visit request" },
      { status: 500 }
    );
  }
}
