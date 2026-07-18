import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";

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
    const userId = "dev-user-123"; // In production, resolve from user session
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
