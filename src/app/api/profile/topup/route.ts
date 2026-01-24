import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount } = await req.json();

    if (!amount || amount <= 0 || amount > 1000) {
      return NextResponse.json({ error: "Invalid amount. Max $1000 per request." }, { status: 400 });
    }

    // Update balance
    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    // Log the financial transaction
    await db.auditLog.create({
      data: {
        action: "WALLET_TOPUP",
        userId: session.userId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ amount, newBalance: user.balance })
      }
    });

    return NextResponse.json({ success: true, balance: user.balance });

  } catch (error) {
    console.error("Top-up Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
