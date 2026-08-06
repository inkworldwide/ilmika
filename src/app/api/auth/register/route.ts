import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Registration input validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  role: z.enum(["USER", "COLLEGE_ADMIN", "AGENT"], {
    message: "Invalid role selected",
  }),
});

export async function POST(req: Request) {
  try {
    // Rate Limiting: max 3 registration requests per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`register_${ip}`, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const body = await req.json();
    
    // Server-side Zod validation
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, country, city, role } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password and create a verification token
    const passwordHash = await hashPassword(password);
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const customId = `EDU${randomDigits}`;

    // In dev: auto-verify email
    const isDev = process.env.NODE_ENV !== "production";

    // Create the User in the database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        plainPassword: password,
        phone,
        country,
        city,
        role: role as Role,
        customId,
        isEmailVerified: isDev ? true : false,
        isApproved: true, // auto-approve for seamless onboarding
        emailVerificationToken: isDev ? null : verificationToken,
      },
    });

    // If College Admin or Agent, create profile
    if (role === "COLLEGE_ADMIN" || role === "AGENT") {
      await prisma.collegeProfile.create({
        data: {
          userId: user.id,
          organizationName: `${name}'s Institution`,
          designation: "Admissions Officer",
          isFeatured: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Registration successful. You can now log in.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
        verificationToken: process.env.NODE_ENV !== "production" ? verificationToken : undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
