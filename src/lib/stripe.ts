import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Use latest API version available or lock to a specific one
  typescript: true,
});
