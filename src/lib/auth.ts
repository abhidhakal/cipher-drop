import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { encrypt, decrypt } from "@/lib/session";

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  // Get User Agent & IP
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown Device";
  const ip = headersList.get("x-forwarded-for") || "::1";

  // 1. Create DB Session
  const session = await db.session.create({
    data: {
      userId,
      token: crypto.randomUUID(), // Session Token
      expiresAt: expires,
      userAgent,
      ipAddress: ip,
      deviceName: parseUserAgent(userAgent),
    }
  });

  // 2. Create JWT with session token
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const jwt = await encrypt({
    sessionId: session.token,
    userId: user.id,
    role: user.role,
    expires
  });

  // 3. Set Cookie
  const cookieStore = await cookies();
  cookieStore.set("session", jwt, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const payload = await decrypt(token);

    // Legacy fallback (if token was created before migration)
    if (!payload.sessionId && payload.userId) {
      return { userId: payload.userId, role: payload.role || "USER", legacy: true };
    }

    // Check DB for revocation state
    if (payload.sessionId) {
      const session = await db.session.findUnique({
        where: { token: payload.sessionId },
        include: { user: true }
      });

      if (!session || session.revoked || new Date() > session.expiresAt) {
        return null; // Session revoked or invalid
      }

      return { ...session, user: session.user, role: session.user.role };
    }

    return null;
  } catch (err) {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    try {
      const payload = await decrypt(token);
      if (payload.sessionId) {
        // Revoke in DB
        await db.session.update({
          where: { token: payload.sessionId },
          data: { revoked: true }
        }).catch(() => { });
      }
    } catch { }
  }

  cookieStore.set("session", "", { expires: new Date(0) });
}

function parseUserAgent(ua: string) {
  if (ua.includes("Macintosh")) return "Mac";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Linux")) return "Linux";
  return "Browser";
}
