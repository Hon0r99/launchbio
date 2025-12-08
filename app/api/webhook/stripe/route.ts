import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    if (isDevelopment) {
      console.warn("⚠️  Missing stripe-signature header (development mode)");
    }
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    if (isDevelopment) {
      console.log(`✅ Webhook event received: ${event.type} (id: ${event.id})`);
    }
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    if (isDevelopment) {
      console.error("   Make sure STRIPE_WEBHOOK_SECRET matches the secret from 'stripe listen'");
    }
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Verify that the payment was successful
    if (session.payment_status === "paid" && session.metadata?.editToken) {
      const editToken = session.metadata.editToken;

      try {
        // Find the page and mark it as Pro
        const page = await prisma.page.findUnique({
          where: { editToken },
        });

        if (page && !page.isPro) {
          await prisma.page.update({
            where: { editToken },
            data: { isPro: true, showBranding: false },
          });

          // Revalidate the pages
          revalidatePath(`/u/${page.slug}`);
          revalidatePath(`/edit/${editToken}`);
          revalidatePath(`/edit/success`);

          console.log(`✅ Page ${page.slug} upgraded to Pro via webhook`);
        } else if (page?.isPro) {
          console.log(`ℹ️  Page ${page.slug} is already Pro`);
        } else {
          console.warn(`⚠️  Page not found for editToken: ${editToken}`);
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
        // Return 500 so Stripe will retry
        return NextResponse.json(
          { error: "Failed to process webhook" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}

