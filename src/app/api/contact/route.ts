import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, purpose, propertyType, city, localities, budget, type } = body;

    const headerType = (type === "Feedback" || type === "feedback") ? "Feedback" : "Contact";
    let notificationText = `New ${headerType} from ${name} (${email}, ${phone}):\n`;
    
    if (purpose) notificationText += `Purpose: ${purpose}\n`;
    if (propertyType) notificationText += `Type: ${propertyType}\n`;
    if (city) notificationText += `City: ${city}\n`;
    if (localities) notificationText += `Localities: ${localities}\n`;
    if (budget) notificationText += `Budget: ${budget}\n`;
    if (message) notificationText += `Message: ${message}`;

    // Find all Admin users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" }
    });

    if (admins.length === 0) {
      console.warn("No admin users found to receive the contact message.");
      return NextResponse.json({ success: true, warning: "Message saved, but no admin found." });
    }

    // Create a notification for each admin
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: NotificationType.ADMIN_ALERT,
      message: notificationText,
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    return NextResponse.json({ success: true, message: "Your message has been sent successfully to our team." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again later." },
      { status: 500 }
    );
  }
}
