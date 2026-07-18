import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";

/**
 * GET /api/collections
 * List all collections for the user.
 */
export async function GET() {
  try {
    const userId = "dev-user-123";
    const db = getDesignRepository();
    const collections = await db.getCollections(userId);

    return NextResponse.json({
      success: true,
      data: collections,
    });
  } catch (error: any) {
    console.error("[API/COLLECTIONS/GET] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch collections." },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections
 * Create a new collection.
 *
 * REQUEST BODY:
 * { "name": "Cozy Living Rooms" }
 */
export async function POST(request: Request) {
  try {
    const userId = "dev-user-123";
    const body = await request.json().catch(() => ({}));
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Collection name is required." },
        },
        { status: 400 }
      );
    }

    const db = getDesignRepository();
    const newCol = await db.createCollection(userId, name.trim());

    return NextResponse.json({
      success: true,
      data: newCol,
    });
  } catch (error: any) {
    console.error("[API/COLLECTIONS/POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to create collection." },
      },
      { status: 500 }
    );
  }
}
