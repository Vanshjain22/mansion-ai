import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";

/**
 * POST /api/designs/variations/[varId]/favorite
 * Toggle the favorite state of a specific variation.
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "isFavorite": true // New status
 * }
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ varId: string }> }
) {
  try {
    const { varId } = await props.params;
    const db = getDesignRepository();
    const isFavorite = await db.toggleFavoriteVariation(varId);

    return NextResponse.json({
      success: true,
      isFavorite,
    });
  } catch (error: any) {
    console.error("[API/DESIGNS/FAVORITE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to toggle favorite." },
      },
      { status: 500 }
    );
  }
}
