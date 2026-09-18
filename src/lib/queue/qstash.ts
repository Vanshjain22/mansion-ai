import { Client } from "@upstash/qstash";

export interface QueuedDesignGeneration {
  designId: string;
  userId: string;
}

function getAppUrl(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return appUrl?.startsWith("https://") ? appUrl : null;
}

export function isQStashConfigured(): boolean {
  return Boolean(
    process.env.QSTASH_TOKEN &&
      process.env.QSTASH_CURRENT_SIGNING_KEY &&
      process.env.QSTASH_NEXT_SIGNING_KEY &&
      getAppUrl()
  );
}

export async function enqueueDesignGeneration(
  payload: QueuedDesignGeneration
): Promise<string> {
  const url = getAppUrl();
  const token = process.env.QSTASH_TOKEN;
  if (!url || !token) {
    throw new Error("QStash requires QSTASH_TOKEN and a public HTTPS NEXT_PUBLIC_APP_URL.");
  }

  const client = new Client({ token });
  const result = await client.publishJSON({
    url: `${url}/api/queue/generate`,
    body: payload,
    retries: 3,
  });

  return result.messageId;
}
