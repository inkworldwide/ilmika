import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const user = await getAuthenticatedUser(req);

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    let shouldIncrementView = true;

    if (user) {
      // 1. Logged-in user view logging
      // Check if user viewed this property recently (e.g. in the last 10 minutes)
      const recentView = await prisma.recentlyViewed.findUnique({
        where: {
          userId_propertyId: {
            userId: user.id,
            propertyId,
          },
        },
      });

      const now = new Date();
      if (recentView) {
        const timeDiff = now.getTime() - new Date(recentView.viewedAt).getTime();
        const tenMinutes = 10 * 60 * 1000;
        if (timeDiff < tenMinutes) {
          shouldIncrementView = false; // Deduplicate within 10 minutes
        }
      }

      // Upsert recently viewed record (updates viewedAt, avoiding duplicate records)
      await prisma.recentlyViewed.upsert({
        where: {
          userId_propertyId: {
            userId: user.id,
            propertyId,
          },
        },
        create: {
          userId: user.id,
          propertyId,
          viewedAt: now,
        },
        update: {
          viewedAt: now,
        },
      });
    } else {
      // 2. Anonymous user view logging
      // We check a cookie value matching viewed_properties
      const cookieHeader = req.headers.get("cookie") || "";
      const viewedCookie = cookieHeader
        .split(";")
        .find(c => c.trim().startsWith("viewed_props="));
      
      let viewedIds: string[] = [];
      if (viewedCookie) {
        try {
          viewedIds = JSON.parse(decodeURIComponent(viewedCookie.split("=")[1]));
        } catch (e) {}
      }

      if (viewedIds.includes(propertyId)) {
        shouldIncrementView = false;
      } else {
        viewedIds.push(propertyId);
      }

      // Set cookie response headers to persist anonymous views
      const response = NextResponse.json({ success: true });
      if (shouldIncrementView) {
        // Increment property viewCount
        await prisma.property.update({
          where: { id: propertyId },
          data: { viewCount: { increment: 1 } },
        });

        response.headers.set(
          "Set-Cookie",
          `viewed_props=${encodeURIComponent(JSON.stringify(viewedIds))}; Path=/; Max-Age=3600; SameSite=Lax`
        );
        return response;
      }
    }

    if (shouldIncrementView) {
      // Increment property viewCount
      await prisma.property.update({
        where: { id: propertyId },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, viewCount: property.viewCount + (shouldIncrementView ? 1 : 0) });
  } catch (error: any) {
    console.error("View increment API error:", error);
    return NextResponse.json(
      { error: "Failed to process property view logging" },
      { status: 500 }
    );
  }
}
