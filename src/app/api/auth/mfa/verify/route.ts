import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // In a real app, we would verify the TOTP code against user.mfaSecret
    // For this simulation, we'll accept '123456' or any 6-digit code for the demo
    if (code.length !== 6) {
      return NextResponse.json({ error: "Invalid MFA code format" }, { status: 400 });
    }

    // Success simulation
    await createSession(user.id, user.role);

    // Audit Log
    await db.auditLog.create({
      data: {
        action: "MFA_VERIFIED",
        userId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ method: "totp" })
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("MFA Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
