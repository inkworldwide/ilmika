import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      const response = NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
      
      // Clear invalid/stale auth_token cookie
      const isProduction = process.env.NODE_ENV === "production";
      const secureFlag = isProduction ? "; Secure" : "";
      response.headers.set(
        "Set-Cookie",
        `auth_token=; HttpOnly; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`
      );
      
      return response;
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Auth Me API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred retrieving session" },
      { status: 500 }
    );
  }
}
