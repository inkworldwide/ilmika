import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET - Check if property is shortlisted by current user
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ isFavourite: false });
    }

    const favourite = await prisma.favourite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    return NextResponse.json({ isFavourite: !!favourite });
  } catch (error: any) {
    console.error("Check favourite error:", error);
    return NextResponse.json(
      { error: "Failed to check bookmark status" },
      { status: 500 }
    );
  }
}

// POST - Toggle bookmark status
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to save properties." },
        { status: 401 }
      );
    }

    // Check if bookmark already exists
    const existing = await prisma.favourite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      // Remove bookmark
      await prisma.favourite.delete({
        where: {
          userId_propertyId: {
            userId: user.id,
            propertyId,
          },
        },
      });
      return NextResponse.json({ isFavourite: false, message: "Removed from saved listings" });
    } else {
      // Create bookmark
      await prisma.favourite.create({
        data: {
          userId: user.id,
          propertyId,
        },
      });
      return NextResponse.json({ isFavourite: true, message: "Saved to your shortlist" });
    }
  } catch (error: any) {
    console.error("Toggle favourite error:", error);
    return NextResponse.json(
      { error: "Failed to toggle saved status" },
      { status: 500 }
    );
  }
}
