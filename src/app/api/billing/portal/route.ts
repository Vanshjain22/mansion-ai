import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getDesignRepository } from "@/lib/db/local-db";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal Session.
 */
export async function POST() {
  try {
    const userId = "dev-user-123";
    const db = getDesignRepository();
    const sub = await db.getSubscription(userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/billing`;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isMock = !stripeKey || stripeKey.startsWith("sk_test_mock");

    if (isMock || !sub?.stripeCustomerId) {
      // In mock development, redirect immediately back with a notification
      return NextResponse.json({
        success: true,
        url: `${returnUrl}?portal_mock=true`,
      });
    }

    const stripe = getStripeClient();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error("[API/BILLING/PORTAL] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to launch billing portal." },
      },
      { status: 500 }
    );
  }
}
