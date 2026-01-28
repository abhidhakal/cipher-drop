import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "@/lib/mail";

import { checkRateLimit } from "@/lib/rate-limit";

// Schema for input validation
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate Limit: 3 attempts per minute (Strict)
  const limit = checkRateLimit(ip, 3, 60000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email },
    });

    // If user not found, we still return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save to DB
    await (db as any).user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send Real Email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (mailError) {
      console.error("Failed to send reset email:", mailError);
      // In production, we might want to alert admins or retry
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
      // In a real app, do NOT return the token. For this demo/coursework, we might 
      // want to surface it if the user can't see the console, but the console log is safer.
      // We will stick to console only for "clean" implementation.
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
