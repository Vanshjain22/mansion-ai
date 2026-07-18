import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";

/**
 * PATCH /api/designs/[id]
 * Rename a design record.
 *
 * REQUEST BODY:
 * { "title": "My Elegant Living Room" }
 */
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json().catch(() => ({}));
    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Title is required." },
        },
        { status: 400 }
      );
    }

    const db = getDesignRepository();
    const updated = await db.renameDesign(id, title.trim());

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("[API/DESIGNS/PATCH] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to rename design." },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/designs/[id]
 * Delete a design record.
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const db = getDesignRepository();
    
    // In production, we'd also trigger storage file deletions
    await db.deleteDesign(id);

    return NextResponse.json({
      success: true,
      message: "Design deleted successfully.",
    });
  } catch (error: any) {
    console.error("[API/DESIGNS/DELETE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Failed to delete design." },
      },
      { status: 500 }
    );
  }
}
