import { NextResponse } from "next/server";
import { getStripeClient, isMockBillingEnabled, isStripeConfigured } from "@/lib/stripe/client";
import { getDesignRepository } from "@/lib/db/local-db";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal Session.
 */
export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } },
        { status: 401 }
      );
    }
    const userId = user.id;
    const db = getDesignRepository();
    const sub = await db.getSubscription(userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/billing`;

    if (isMockBillingEnabled()) {
      // In mock development, redirect immediately back with a notification
      return NextResponse.json({
        success: true,
        url: `${returnUrl}?portal_mock=true`,
      });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: { code: "BILLING_UNAVAILABLE", message: "Billing is not configured." } },
        { status: 503 }
      );
    }

    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: { code: "NO_SUBSCRIPTION", message: "No active subscription was found." } },
        { status: 404 }
      );
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
