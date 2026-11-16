// File: app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  category: z.enum(["editorial", "press", "advertising", "support", "general"]),
  subject: z.string().trim().min(4, "Subject must be at least 4 characters").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    // In local / production without external ticket service, log message receipt
    console.log(`[Contact Form Received] From: ${validated.name} <${validated.email}> | Category: ${validated.category} | Subject: ${validated.subject}`);

    return NextResponse.json({
      message: "Thank you for contacting TheTathyaNews. Your message has been routed to our editorial desk.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 });
  }
}
