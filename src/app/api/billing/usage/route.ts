import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";

/**
 * GET /api/billing/usage
 *
 * Fetches user credit balances, subscriptions, ledgers, and usage analytics.
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "credits": 8,
 *     "subscription": { "plan": "pro", "status": "active", ... },
 *     "transactions": [ ... ],
 *     "analytics": {
 *       "totalSpent": 2,
 *       "totalPurchased": 10,
 *       "generationsCount": 2,
 *       "dailyUsage": [ { "date": "07/16", "count": 2 } ]
 *     }
 *   }
 * }
 */
export async function GET() {
  try {
    const userId = "dev-user-123"; // Resolved from session in production
    const db = getDesignRepository();

    // 1. Fetch data from DB
    const credits = await db.getUserCredits(userId);
    const subscription = await db.getSubscription(userId);
    const transactions = await db.getTransactionHistory(userId);
    const designs = await db.listDesigns(userId);

    // 2. Compute Analytics Metrics
    const totalSpent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalPurchased = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const generationsCount = designs.filter((d) => d.status === "completed").length;

    // Daily consumption stats grouping
    // Loop last 7 days and sum credit expenditures
    const dailyUsage: Array<{ date: string; count: number }> = [];
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * oneDayMs);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      // Filter transaction spent on this day
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + oneDayMs;
      
      const daySpent = transactions
        .filter((t) => t.amount < 0 && t.createdAt >= dayStart && t.createdAt < dayEnd)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      dailyUsage.push({
        date: dateStr,
        count: daySpent,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        credits,
        subscription,
        transactions,
        analytics: {
          totalSpent,
          totalPurchased,
          generationsCount,
          dailyUsage,
        },
      },
    });
  } catch (error: any) {
    console.error("[API/BILLING/USAGE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to retrieve billing metrics." },
      },
      { status: 500 }
    );
  }
}
