import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ReportReason } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const reportSchema = z.object({
  reason: z.enum([
    "FAKE_PROPERTY",
    "INCORRECT_INFORMATION",
    "DUPLICATE_LISTING",
    "ALREADY_SOLD_OR_RENTED",
    "SUSPICIOUS_OWNER",
    "SPAM",
    "OTHER"
  ]),
  details: z.string().min(5, "Please provide at least 5 characters of detail"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate Limiting: max 3 report filings per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`report_${ip}`, 3, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to report listings." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { reason, details } = parsed.data;

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Insert the report record
    const report = await prisma.propertyReport.create({
      data: {
        propertyId,
        reporterId: user.id,
        reason: reason as ReportReason,
        details,
      },
    });

    return NextResponse.json(
      { message: "Property reported successfully. Thank you for flagging.", report },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Report property error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred filing the report" },
      { status: 500 }
    );
  }
}
