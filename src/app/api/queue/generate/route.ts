import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { processQueuedDesign } from "@/lib/queue/processor";

interface GenerateMessage {
  designId: string;
  userId: string;
}

async function handler(request: Request) {
  const body = (await request.json()) as Partial<GenerateMessage>;
  if (!body.designId || !body.userId) {
    return Response.json({ success: false, error: "Invalid queue message." }, { status: 400 });
  }

  await processQueuedDesign(body.designId, body.userId);
  return Response.json({ success: true });
}

// Verifies the Upstash-Signature using QSTASH_CURRENT_SIGNING_KEY and
// QSTASH_NEXT_SIGNING_KEY before any generation work begins.
export const POST = verifySignatureAppRouter(handler);
