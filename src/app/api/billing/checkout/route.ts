import { NextResponse } from "next/server";
import {
  getPlanByPriceId,
  getStripeClient,
  isMockBillingEnabled,
  isStripeConfigured,
} from "@/lib/stripe/client";
import { getDesignRepository } from "@/lib/db/local-db";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout Session for subscription plans or credit packs.
 *
 * REQUEST BODY:
 * {
 *   "priceId": "price_mock_pro_monthly_19"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "priceId is required." },
        },
        { status: 400 }
      );
    }

    const plan = getPlanByPriceId(priceId);
    if (!plan || plan.id === "free") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PRICE", message: "The requested plan is not available." },
        },
        { status: 400 }
      );
    }

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } },
        { status: 401 }
      );
    }
    const userId = user.id;
    const email = user.email || "";

    const db = getDesignRepository();
    const sub = await db.getSubscription(userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/billing?success=true`;
    const cancelUrl = `${appUrl}/pricing?cancelled=true`;

    if (isMockBillingEnabled()) {
      // ── MOCK GATEWAY CONTEXT (Development) ──
      // Generate a mock checkout completion URL pointing to our webhook endpoint
      // This simulates a successful redirect, crediting the local account instantly!
      const mockParams = new URLSearchParams({
        mock_checkout_completed: "true",
        priceId,
        userId,
      });
      const mockCheckoutUrl = `/api/billing/webhook?${mockParams.toString()}`;

      return NextResponse.json({
        success: true,
        url: mockCheckoutUrl,
      });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BILLING_UNAVAILABLE", message: "Billing is not configured." },
        },
        { status: 503 }
      );
    }

    // ── STRIPE LIVE GATEWAY CONTEXT ──
    const stripe = getStripeClient();

    // Determine checkout mode (subscription vs one-time credit payments)
    const stripeCustomerId = sub?.stripeCustomerId || undefined;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : email,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error("[API/BILLING/CHECKOUT] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to create checkout session." },
      },
      { status: 500 }
    );
  }
}
