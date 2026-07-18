import { NextResponse } from "next/server";
import { getStripeClient, PLANS } from "@/lib/stripe/client";
import { getDesignRepository } from "@/lib/db/local-db";

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

    const userId = "dev-user-123"; // Resolve from session in production
    const email = "test-user@mansion-ai.com";

    const db = getDesignRepository();
    const sub = await db.getSubscription(userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/billing?success=true`;
    const cancelUrl = `${appUrl}/pricing?cancelled=true`;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isMock = !stripeKey || stripeKey.startsWith("sk_test_mock");

    if (isMock) {
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

    // ── STRIPE LIVE GATEWAY CONTEXT ──
    const stripe = getStripeClient();

    // Determine checkout mode (subscription vs one-time credit payments)
    const isSubscription = priceId.startsWith("price_"); // price_ ID implies plan subscription
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
      mode: isSubscription ? "subscription" : "payment",
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
