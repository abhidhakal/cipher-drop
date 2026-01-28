import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { updatePasswordHistory } from "@/lib/password-policies";
import { hashPassword } from "@/lib/auth-utils";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/, "Must contain uppercase").regex(/[a-z]/, "Must contain lowercase").regex(/[0-9]/, "Must contain number").regex(/[^A-Za-z0-9]/, "Must contain special char"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Find user with valid token
    const user = await (db as any).user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Check password history
    try {
      await updatePasswordHistory(user.id, password); // This will throw if reused
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user
    await (db as any).user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordLastChanged: new Date(),
      },
    });

    return NextResponse.json({ message: "Password reset successfully" });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
