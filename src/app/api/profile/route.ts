import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, mfaEnabled: true, balance: true }
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, mfaEnabled } = await req.json();

  await db.user.update({
    where: { id: session.userId },
    data: { name, mfaEnabled }
  });

  await db.auditLog.create({
    data: {
      action: "UPDATE_PROFILE",
      userId: session.userId,
      metadata: JSON.stringify({ mfaEnabled }),
      ipAddress: "user-action"
    }
  });

  return NextResponse.json({ success: true });
}
