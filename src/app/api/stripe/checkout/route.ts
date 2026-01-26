import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount } = await req.json(); // Amount in dollars

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert to cents
    const amountInCents = Math.round(amount * 100);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CipherDrop Wallet Top-up",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile?canceled=true`,
      metadata: {
        userId: session.userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
