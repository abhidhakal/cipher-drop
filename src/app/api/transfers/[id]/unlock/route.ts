import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptData } from "@/lib/crypto";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await Promise.resolve(params);

  // Using $transaction to ensure ACID compliance during the financial exchange
  try {
    const result = await db.$transaction(async (tx: any) => {
      // 1. Fetch the drop and current user balance
      const drop = await tx.fileDrop.findUnique({
        where: { id },
        include: { sender: true }
      });

      if (!drop) throw new Error("Drop not found");

      const currentUser = await tx.user.findUnique({
        where: { id: session.userId }
      });

      if (!currentUser) throw new Error("User not found");

      // 2. Access/Verification logic (Skip payment if owner or already paid)
      const isOwner = drop.senderId === session.userId;

      if (drop.status !== "PAID" && !isOwner) {
        // Validation: If a receiver is specified, ensure it matches
        if (drop.receiverId && drop.receiverId !== session.userId) {
          throw new Error("AC01: Access Denied. Targeted recipient only.");
        }

        // 3. Payment Logic (Ledger Verification)
        if (currentUser.balance < drop.price) {
          throw new Error(`Insufficient funds. Your balance: $${currentUser.balance.toFixed(2)}. Required: $${drop.price.toFixed(2)}`);
        }

        // Deduct from buyer
        const buyerUpdate = await tx.user.update({
          where: { id: currentUser.id },
          data: { balance: { decrement: drop.price } }
        });

        // Increment to sender
        const senderUpdate = await tx.user.update({
          where: { id: drop.senderId },
          data: { balance: { increment: drop.price } }
        });

        console.log(`[PAYMENT] ${drop.price} transferred from ${currentUser.email} (${buyerUpdate.balance}) to ${drop.sender.email} (${senderUpdate.balance})`);

        // Update status for this drop globally & SET RECEIVER so it shows in their inbox
        await tx.fileDrop.update({
          where: { id },
          data: {
            status: "PAID",
            receiverId: !drop.receiverId ? session.userId : undefined // logic: if generic drop, claim it. If private, keep it.
          }
        });

        // Log the financial transaction
        await tx.auditLog.create({
          data: {
            action: "SECURE_TRANSACTION_SUCCESS",
            userId: session.userId,
            ipAddress: req.headers.get("x-forwarded-for") || "unknown",
            metadata: JSON.stringify({
              amount: drop.price,
              dropId: drop.id,
              from: currentUser.email,
              to: drop.sender.email
            })
          }
        });
      }

      // 4. Decrypt
      const payload = JSON.parse(drop.encryptedLink);
      const content = decryptData(payload.c, payload.iv, payload.tag);

      // 5. Self-Destruct Logic (Policy: One-time View)
      if (drop.oneTimeView) {
        await tx.fileDrop.delete({ where: { id: drop.id } });
      }

      // Log Access
      await tx.auditLog.create({
        data: {
          action: drop.oneTimeView ? "FILE_DECRYPTED_AND_DESTROYED" : "FILE_DECRYPTED",
          userId: session.userId,
          metadata: JSON.stringify({ dropId: drop.id, destroyed: drop.oneTimeView }),
          ipAddress: req.headers.get("x-forwarded-for") || "unknown"
        }
      });

      return { content };
    });

    return NextResponse.json(result);

  } catch (e: any) {
    console.error("Secure Unlock Error:", e);
    return NextResponse.json({ error: e.message || "Decryption Failed" }, { status: 400 });
  }
}
