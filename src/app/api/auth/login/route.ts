import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    // Rate Limiting: max 5 login attempts per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check account suspension
    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account has been suspended by the administrator. Please contact support." },
        { status: 403 }
      );
    }

    // Check admin approval
    if (!user.isApproved && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Your account is pending admin approval." },
        { status: 403 }
      );
    }

    // Sign JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Create Response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });

    // Set HTTP-only cookie — omit Secure on local dev so HTTP localhost works
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}${isProduction ? "; Secure" : ""}`;
    response.headers.set("Set-Cookie", `auth_token=${token}; ${cookieOptions}`);

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
