import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Schema for input validation
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
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

    // SIMULATE EMAIL SENDING
    console.log("=========================================");
    console.log(`[SIMULATED EMAIL] To: ${email}`);
    console.log(`Subject: Reset your CipherDrop password`);
    console.log(`Link: http://localhost:3000/reset-password?token=${resetToken}`);
    console.log("=========================================");

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
