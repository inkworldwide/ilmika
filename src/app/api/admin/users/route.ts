import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET - List all users (Admin Only)
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        customId: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        role: true,
        isEmailVerified: true,
        isApproved: true,
        isSuspended: true,
        createdAt: true,
        plainPassword: true,
        colleges: {
          select: {
            city: {
              select: { name: true }
            }
          },
          take: 1
        },
        collegeProfile: {
          select: {
            id: true,
            organizationName: true,
            designation: true,
            ratingAverage: true,
            isFeatured: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Fetch admin users error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user directory" },
      { status: 500 }
    );
  }
}

// PUT - Update user role & details (Admin Only)
export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { targetUserId, name, email, phone, role, isApproved, isSuspended, isAgentFeatured, password } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Check if target user is last admin
    if (targetUserId === user.id && role !== undefined && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot self-demote. You must remain an Administrator." },
        { status: 400 }
      );
    }

    // Update fields dynamically
    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (phone !== undefined) updateData.phone = phone || null;
      if (role !== undefined) updateData.role = role as Role;
      if (isApproved !== undefined) updateData.isApproved = isApproved;
      if (isSuspended !== undefined) updateData.isSuspended = isSuspended;
      if (password !== undefined && password.trim() !== "") {
        updateData.plainPassword = password;
        updateData.passwordHash = await hashPassword(password);
      }

      const u = await tx.user.update({
        where: { id: targetUserId },
        data: updateData,
      });

      // If approving an COLLEGE_ADMIN or AGENT, ensure CollegeProfile exists
      const targetUserRole = role || user.role;
      if (isApproved && (targetUserRole === "COLLEGE_ADMIN" || targetUserRole === "AGENT")) {
        const existing = await tx.collegeProfile.findUnique({
          where: { userId: targetUserId },
        });
        if (!existing) {
          await tx.collegeProfile.create({
            data: {
              userId: targetUserId,
              organizationName: "College Admissions Desk",
              designation: "Advisor",
              isFeatured: true,
            },
          });
        }
      }

      if (isAgentFeatured !== undefined) {
        const profile = await tx.collegeProfile.findUnique({
          where: { userId: targetUserId },
        });
        if (profile) {
          await tx.collegeProfile.update({
            where: { userId: targetUserId },
            data: { isFeatured: isAgentFeatured },
          });
        } else if (isAgentFeatured) {
          await tx.collegeProfile.create({
            data: {
              userId: targetUserId,
              organizationName: "Ink EduVerse Advisor",
              designation: "College Advisor",
              isFeatured: true,
            },
          });
        }
      }

      return u;
    });

    return NextResponse.json({ message: "User updated successfully", user: updated });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user account details" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account (Admin Only)
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "Demise warning: Cannot delete your own active administrator session." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ message: "User account deleted successfully" });
  } catch (error: any) {
    console.error("Delete user account error:", error);
    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
