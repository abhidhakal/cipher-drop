import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-utils";
import { createSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate Limit: 5 attempts per minute
  const limit = checkRateLimit(ip, 5, 60000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  try {
    const { email, password, recaptchaToken } = await req.json();

    // 0.5 CAPTCHA Verification (Policy: Bot Prevention)
    const captchaResult = await verifyRecaptcha(recaptchaToken, "login");
    if (!captchaResult.success) {
      return NextResponse.json({
        error: "CAPTCHA verification failed. Please try again."
      }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    // Timing attack mitigation: always take some time to verify
    // But for logic:
    if (!user) {
      // Fake delay?
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 1. Check Lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${waitMinutes} minutes.` },
        { status: 429 }
      );
    }

    // 2. Check Password Expiration (Mandatory Security Policy: 90 Days)
    const EXPIRATION_DAYS = 90;
    const expirationDate = new Date(user.passwordLastChanged);
    expirationDate.setDate(expirationDate.getDate() + EXPIRATION_DAYS);

    if (new Date() > expirationDate) {
      return NextResponse.json({
        error: "Your password has expired. Please reset it to continue.",
        resetRequired: true
      }, { status: 403 });
    }

    // 3. Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      // Increment failures
      const newAttempts = user.failedLoginAttempts + 1;
      let updateData: any = { failedLoginAttempts: newAttempts };

      if (newAttempts >= MAX_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await db.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Audit Log for failure
      await db.auditLog.create({
        data: {
          action: "FAILED_LOGIN",
          userId: user.id,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          metadata: JSON.stringify({ attempts: newAttempts })
        }
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Success - Reset counters
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    // 5. MFA Check
    if (user.mfaEnabled) {
      // Return a temporary token or just a flag to show MFA UI
      return NextResponse.json({
        mfaRequired: true,
        tempUserId: user.id, // In production, use a signed short-lived token
        message: "Please enter your 2FA code"
      });
    }

    // 6. Create Session
    await createSession(user.id);

    // Audit Log for Success
    await db.auditLog.create({
      data: {
        action: "LOGIN",
        userId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ method: "password" })
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
