import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Fetch ads error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { name, imageUrl, targetUrl, placement, format, displayOrder, isActive } = body;

    if (!name || !imageUrl || !targetUrl) {
      return NextResponse.json({ error: "Name, Image URL, and Target URL are required" }, { status: 400 });
    }

    const ad = await prisma.advertisement.create({
      data: {
        name,
        imageUrl,
        targetUrl,
        placement: placement || "BOTH",
        format: format || "FULL_WIDTH",
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ message: "Advertisement created successfully", ad });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, imageUrl, targetUrl, placement, format, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(imageUrl && { imageUrl }),
        ...(targetUrl && { targetUrl }),
        ...(placement && { placement }),
        ...(format && { format }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ message: "Advertisement updated successfully", ad });
  } catch (error) {
    console.error("Update ad error:", error);
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    await prisma.advertisement.delete({ where: { id } });

    return NextResponse.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Delete ad error:", error);
    return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
  }
}
