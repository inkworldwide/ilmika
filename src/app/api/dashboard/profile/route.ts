import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  organizationName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

// GET - Load User Profile details
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        collegeProfile: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Profile load error:", error);
    return NextResponse.json(
      { error: "Failed to load profile details" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, avatar, organizationName, designation, bio } = parsed.data;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const usr = await tx.user.update({
        where: { id: user.id },
        data: {
          name,
          phone,
          avatar,
        },
      });

      if (user.role === "COLLEGE_ADMIN" || user.role === "AGENT") {
        await tx.collegeProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            organizationName: organizationName || "",
            designation: designation || "",
            bio: bio || "",
          },
          update: {
            organizationName: organizationName || "",
            designation: designation || "",
            bio: bio || "",
          },
        });
      }

      return usr;
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile details" },
      { status: 500 }
    );
  }
}
