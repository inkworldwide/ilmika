import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number").optional().nullable(),
  avatar: z.string().optional().nullable(),
  
  // Agent Profile details (only for agents)
  companyName: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).optional().nullable(),
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
        agentProfile: true,
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

    // Validate inputs
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, avatar, companyName, experienceYears, bio } = parsed.data;

    // Update User model inside a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update primary user fields
      const usr = await tx.user.update({
        where: { id: user.id },
        data: {
          name,
          phone,
          avatar,
        },
      });

      // 2. If user is an AGENT, upsert their AgentProfile
      if (user.role === "AGENT") {
        await tx.agentProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            companyName: companyName || "",
            experienceYears: experienceYears || 0,
            bio: bio || "",
          },
          update: {
            companyName: companyName || "",
            experienceYears: experienceYears || 0,
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
