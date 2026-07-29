import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { Role } from "@prisma/client";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Registration input validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  role: z.enum(["USER", "OWNER", "AGENT"], {
    message: "Invalid role selected",
  }),
});

export async function POST(req: Request) {
  try {
    // Rate Limiting: max 3 registration requests per minute per IP
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`register_${ip}`, 3, 60000);
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

    const { name, email, password, phone, role } = parsed.data;

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

    const getPrefix = (cityName?: string) => {
      if (!cityName) return "KO";
      const clean = cityName.trim().toUpperCase();
      if (clean.startsWith("BENGALURU") || clean.startsWith("BANGALORE")) return "BE";
      if (clean.startsWith("KOCHI") || clean.startsWith("COCHIN")) return "KO";
      if (clean.startsWith("MUMBAI") || clean.startsWith("BOMBAY")) return "MU";
      if (clean.startsWith("DELHI")) return "DE";
      if (clean.startsWith("HYDERABAD")) return "HY";
      if (clean.startsWith("CHENNAI")) return "CH";
      if (clean.startsWith("PUNE")) return "PU";
      if (clean.startsWith("KOLKATA")) return "KO";
      if (clean.startsWith("AHMEDABAD")) return "AH";
      if (clean.startsWith("GURUGRAM") || clean.startsWith("GURGAON")) return "GU";
      if (clean.startsWith("NOIDA")) return "NO";
      return clean.substring(0, 2);
    };

    const cityPrefix = getPrefix(body.city);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const customId = `${cityPrefix}${randomDigits}`;

    // In dev: auto-verify email so user can login immediately without email link
    const isDev = process.env.NODE_ENV !== "production";

    // Create the User in the database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        plainPassword: password,
        phone: phone || null,
        role,
        customId,
        isEmailVerified: isDev ? true : false, // auto-verify in dev
        emailVerificationToken: isDev ? null : verificationToken,
      },
    });

    // Create Response
    const response = NextResponse.json(
      {
        message: "Registration successful. Your account is pending admin approval. You can log in once approved.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
        // We output the verification token in development so we can mock verify it easily
        verificationToken: process.env.NODE_ENV !== "production" ? verificationToken : undefined,
      },
      { status: 201 }
    );

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
