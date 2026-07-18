import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";

/**
 * POST /api/collections/[collectionId]/designs
 * Associate or dissociate a design from a collection.
 *
 * REQUEST BODY:
 * {
 *   "designId": "design_abc123",
 *   "action": "add" | "remove"
 * }
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await props.params;
    const body = await request.json().catch(() => ({}));
    const { designId, action } = body;

    if (!designId || !action || !["add", "remove"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "designId and action ('add'|'remove') are required." },
        },
        { status: 400 }
      );
    }

    const db = getDesignRepository();

    if (action === "add") {
      await db.addDesignToCollection(collectionId, designId);
    } else {
      await db.removeDesignFromCollection(collectionId, designId);
    }

    return NextResponse.json({
      success: true,
      message: `Design successfully ${action === "add" ? "added to" : "removed from"} collection.`,
    });
  } catch (error: any) {
    console.error("[API/COLLECTIONS/DESIGNS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to update collection mapping." },
      },
      { status: 500 }
    );
  }
}
