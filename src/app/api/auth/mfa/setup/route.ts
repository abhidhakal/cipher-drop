import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import * as OTPAuth from "otpauth";

// GET: Get MFA setup info (generate new secret if needed)
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If MFA is already enabled, return status only
    if (user.mfaEnabled) {
      return NextResponse.json({
        mfaEnabled: true,
        message: "MFA is already enabled"
      });
    }

    // Generate a new TOTP secret
    const secret = new OTPAuth.Secret({ size: 20 });

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: "CipherDrop",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Store the secret temporarily (not enabled yet)
    await db.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret.base32 }
    });

    return NextResponse.json({
      mfaEnabled: false,
      secret: secret.base32,
      otpauthUri: totp.toString(),
    });

  } catch (error) {
    console.error("MFA Setup Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST: Verify the initial code and enable MFA
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.mfaSecret) {
      return NextResponse.json({ error: "MFA not set up" }, { status: 400 });
    }

    // Verify the TOTP code
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
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    // Enable MFA
    await db.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true }
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        action: "MFA_ENABLED",
        userId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ method: "totp" })
      }
    });

    return NextResponse.json({
      success: true,
      message: "MFA has been enabled successfully"
    });

  } catch (error) {
    console.error("MFA Enable Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// DELETE: Disable MFA
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });
    }

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Please enter your 2FA code" }, { status: 400 });
    }

    // Verify the TOTP code before disabling
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
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    // Disable MFA
    await db.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null
      }
    });

    // Audit Log
    await db.auditLog.create({
      data: {
        action: "MFA_DISABLED",
        userId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ method: "totp" })
      }
    });

    return NextResponse.json({
      success: true,
      message: "MFA has been disabled"
    });

  } catch (error) {
    console.error("MFA Disable Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
