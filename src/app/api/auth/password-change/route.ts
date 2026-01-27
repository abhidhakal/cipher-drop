import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyPassword, hashPassword, UpdatePasswordSchema } from "@/lib/auth-utils";
import { isPasswordReused, updatePasswordHistory } from "@/lib/password-policies";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // 1. Zod Validation (Policy: Length & Complexity)
    const result = UpdatePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: "Complexity requirement not met.",
        details: result.error.flatten()
      }, { status: 400 });
    }

    const { currentPassword, newPassword } = result.data;

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Verify Current Password
    const isMatched = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatched) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    // 3. Check for Password Reuse (Policy: Block recent reuse)
    const isReused = await isPasswordReused(user.id, newPassword);
    if (isReused) {
      return NextResponse.json({
        error: "You cannot reuse your last 3 passwords. Please choose a new one."
      }, { status: 400 });
    }

    // 4. Hash and Update
    const newHashed = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHashed,
        passwordLastChanged: new Date(), // Reset Expiry Timer
      }
    });

    // 5. Update History
    await updatePasswordHistory(user.id, newHashed);

    // 6. Audit Log
    await db.auditLog.create({
      data: {
        action: "PASSWORD_CHANGED",
        userId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ event: "profile_update" })
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Password Change Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
