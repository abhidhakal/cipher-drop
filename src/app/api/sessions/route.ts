import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await db.session.findMany({
      where: {
        userId: session.userId,
        revoked: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActive: "desc" },
      select: {
        id: true,
        token: true,
        ipAddress: true,
        userAgent: true,
        deviceName: true,
        lastActive: true,
        createdAt: true
      }
    });

    // Mark the current session
    // Since payload.sessionId is not exposed directly in getSession return often, 
    // but in our auth.ts we have {...session, ...}
    // We can find the current one by matching the token if we had it. 
    // In our implementation, getSession returns the session object from DB.

    return NextResponse.json({
      sessions,
      currentSessionId: 'legacy' in session ? null : session.id
    });
  } catch (error) {
    console.error("Sessions GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Revoke all OTHER sessions
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Legacy sessions don't have a session ID to exclude
    const currentSessionId = 'legacy' in session ? undefined : session.id;

    await db.session.updateMany({
      where: {
        userId: session.userId,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
        revoked: false
      },
      data: { revoked: true }
    });

    return NextResponse.json({ success: true, message: "All other sessions revoked" });
  } catch (error) {
    console.error("Sessions DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
