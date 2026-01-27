import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import * as OTPAuth from "otpauth";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate code format
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid MFA code format" }, { status: 400 });
    }

    // Check if user has MFA configured
    if (!user.mfaSecret || !user.mfaEnabled) {
      return NextResponse.json({ error: "MFA not configured for this user" }, { status: 400 });
    }

    // Verify the TOTP code against the stored secret
    const totp = new OTPAuth.TOTP({
      issuer: "CipherDrop",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.mfaSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      // Invalid code - log failed attempt
      await db.auditLog.create({
        data: {
          action: "MFA_FAILED",
          userId: user.id,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          metadata: JSON.stringify({ reason: "invalid_code" })
        }
      });
      return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
    }

    // Success - create session
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
