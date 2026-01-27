import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { encryptData } from "@/lib/crypto";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, content, price, recipientEmail, oneTimeView } = await req.json();

    let receiverId = null;
    if (recipientEmail) {
      const receiver = await db.user.findUnique({ where: { email: recipientEmail } });
      if (receiver) {
        receiverId = receiver.id;
      }
    }

    const { encrypted, iv, authTag } = encryptData(content);

    const securedPayload = JSON.stringify({
      c: encrypted,
      iv,
      tag: authTag
    });

    const drop = await db.fileDrop.create({
      data: {
        title,
        encryptedLink: securedPayload,
        price: parseFloat(price),
        senderId: session.userId,
        receiverId: receiverId,
        oneTimeView: !!oneTimeView,
        status: parseFloat(price) > 0 ? "PENDING" : "PAID"
      },
    });

    await db.auditLog.create({
      data: {
        action: "CREATE_DROP",
        userId: session.userId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        metadata: JSON.stringify({ dropId: drop.id, price, oneTimeView })
      },
    });

    return NextResponse.json({ success: true, id: drop.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
