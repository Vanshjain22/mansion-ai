import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/designs
 *
 * List all designs for the user.
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "...", "title": "...", "variations": [...] }
 *   ]
 * }
 */
export async function GET() {
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
    const designs = await db.listDesigns(userId);

    return NextResponse.json({
      success: true,
      data: designs,
    });
  } catch (error: any) {
    console.error("[API/DESIGNS/GET] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to list designs." },
      },
      { status: 500 }
    );
  }
}
