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

    // Validate inputs
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { rating, comment } = parsed.data;

    // Verify agent profile exists
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: agentUserId },
    });

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Agent profile not found." },
        { status: 404 }
      );
    }

    // A user cannot review themselves
    if (agentUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot review your own profile." },
        { status: 400 }
      );
    }

    // Execute atomic transaction for review insertion and average rating updates
    const reviewResult = await prisma.$transaction(async (tx) => {
      // 1. Check duplicate review
      const existingReview = await tx.review.findUnique({
        where: {
          reviewerId_agentProfileId: {
            reviewerId: user.id,
            agentProfileId: agentProfile.id,
          },
        },
      });

      if (existingReview) {
        throw new Error("You have already reviewed this agent.");
      }

      // 2. Create the review
      const rev = await tx.review.create({
        data: {
          reviewerId: user.id,
          agentProfileId: agentProfile.id,
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // 3. Recalculate average rating
      const aggregateResult = await tx.review.aggregate({
        where: { agentProfileId: agentProfile.id },
        _avg: {
          rating: true,
        },
      });

      const ratingAverage = aggregateResult._avg.rating || rating;

      // 4. Update agent profile average rating
      await tx.agentProfile.update({
        where: { id: agentProfile.id },
        data: { ratingAverage },
      });

      return rev;
    });

    return NextResponse.json(
      { message: "Review posted successfully", review: reviewResult },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Agent review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
