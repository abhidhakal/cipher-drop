import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    // Retrieve the user ID from metadata
    const userId = session.metadata?.userId;
    const amountTotal = session.amount_total; // in cents

    if (userId && amountTotal) {
      const amountDollars = amountTotal / 100;

      try {
        await db.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id: userId },
            data: {
              balance: { increment: amountDollars }
            }
          });

          await tx.auditLog.create({
            data: {
              action: "WALLET_TOPUP_STRIPE",
              userId: userId,
              ipAddress: "stripe-webhook",
              metadata: JSON.stringify({
                amount: amountDollars,
                newBalance: user.balance,
                stripeSessionId: session.id
              })
            }
          });
        });
        console.log(`User ${userId} topped up $${amountDollars}`);
      } catch (error) {
        console.error('Error updating user balance:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
