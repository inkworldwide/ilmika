import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5 stars"),
  comment: z.string().min(3, "Review comment must be at least 3 characters"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentUserId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to write reviews." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { rating, comment } = parsed.data;

    // Verify college profile exists
    const collegeProfile = await prisma.collegeProfile.findUnique({
      where: { userId: agentUserId },
    });

    if (!collegeProfile) {
      return NextResponse.json(
        { error: "Advisor profile not found." },
        { status: 404 }
      );
    }

    if (agentUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot review your own profile." },
        { status: 400 }
      );
    }

    const reviewResult = await prisma.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          reviewerId: user.id,
          collegeProfileId: collegeProfile.id,
          collegeId: collegeProfile.id, // linked fallback
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      const aggregateResult = await tx.review.aggregate({
        where: { collegeProfileId: collegeProfile.id },
        _avg: { rating: true },
      });

      const ratingAverage = aggregateResult._avg.rating || rating;

      await tx.collegeProfile.update({
        where: { id: collegeProfile.id },
        data: { ratingAverage },
      });

      return rev;
    });

    return NextResponse.json(
      { message: "Review posted successfully", review: reviewResult },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Advisor review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
