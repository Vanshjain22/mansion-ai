import type { PresignedUrlResponse } from "./types";

/**
 * UPLOAD SERVICE — Client-side network layer
 *
 * This module handles communication with the server and storage.
 * It knows HOW to upload but not WHEN or WHY — that's the hook's job.
 *
 * Two functions, two responsibilities:
 * 1. requestPresignedUrl() → asks our server for a signed upload URL
 * 2. uploadToStorage() → uploads the file directly to storage
 *
 * PRESIGNED URL FLOW:
 * ┌──────┐    POST /api/upload/presign    ┌──────┐
 * │Client│ ────────────────────────────► │Server│
 * │      │ ◄──── { presignedUrl, ... } ── │      │
 * └──────┘                                └──────┘
 *      │
 *      │  PUT presignedUrl (file bytes)   ┌───────┐
 *      └──────────────────────────────► │Storage│
 *         ◄──── 200 OK ──────────────── │       │
 *                                        └───────┘
 *
 * The client never sends file bytes to OUR server — they go directly
 * to storage. Our server only generates the permission (signed URL).
 */

/**
 * Request a presigned URL from our API server.
 * The server generates a time-limited, single-use URL that authorizes
 * the client to upload directly to the storage backend.
 */
export async function requestPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  const response = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, contentType }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to get upload URL (${response.status})`
    );
  }

  const data = await response.json();
  return data.data as PresignedUrlResponse;
}

/**
 * Upload a file to storage using a presigned URL.
 *
 * WHY XMLHttpRequest INSTEAD OF fetch()?
 *
 * The Fetch API does not support upload progress events.
 * fetch() has no equivalent to xhr.upload.onprogress.
 * There's a Streams API proposal for this, but browser support is incomplete.
 *
 * For downloads, fetch + ReadableStream works for progress.
 * For uploads, XMLHttpRequest is still the only reliable option.
 *
 * This is one of those cases where the "old" API is genuinely better.
 * Every file upload library (Uppy, Filepond, Dropzone.js) uses XHR internally.
 */
export function uploadToStorage(
  presignedUrl: string,
  file: File | Blob,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload. Please check your connection."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was cancelled."));
    });

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}
