import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before revoking
    const sessionToRevoke = await db.session.findUnique({
      where: { id }
    });

    if (!sessionToRevoke || sessionToRevoke.userId !== session.userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await db.session.update({
      where: { id },
      data: { revoked: true }
    });

    return NextResponse.json({ success: true, message: "Session revoked" });
  } catch (error) {
    console.error("Session DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
