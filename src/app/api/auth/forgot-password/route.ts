import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate email
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Security practice: Return success even if email does not exist to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        message: "If a matching account exists, a password reset token has been generated.",
      });
    }

    // Generate token expiring in 1 hour
    const passwordResetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    return NextResponse.json({
      message: "If a matching account exists, a password reset token has been generated.",
      // Return the token for development and validation testing
      resetToken: passwordResetToken,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred processing password reset request" },
      { status: 500 }
    );
  }
}
