"use client";

import { Dropzone } from "@/components/features/upload/dropzone";
import type { UploadedFile } from "@/lib/upload/types";
import { useState } from "react";

/**
 * Upload Demo Page — Testing ground for the upload system.
 *
 * This page exists solely to verify the Dropzone component works
 * end-to-end. It demonstrates the minimal integration required:
 * just two callbacks (onUploadComplete, onUploadError).
 *
 * ROUTE: /upload-demo
 *
 * This is inside a (testing) route group. The parentheses in "(testing)"
 * tell Next.js this is a LOGICAL group — it affects layout inheritance
 * but NOT the URL. The URL is /upload-demo, not /testing/upload-demo.
 */

export default function UploadDemoPage() {
  const [lastUpload, setLastUpload] = useState<UploadedFile | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleUploadComplete = (file: UploadedFile) => {
    setLastUpload(file);
    setLastError(null);
  };

  const handleUploadError = (error: string) => {
    setLastError(error);
    setLastUpload(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">
          <span className="text-gradient">Upload Test</span>
        </h1>
        <p className="text-text-secondary mb-8">
          Test the complete upload pipeline: validation → compression → presigned
          URL → storage.
        </p>

        {/* The Dropzone — this is the entire integration surface */}
        <Dropzone
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />

        {/* Debug output — shows the raw UploadedFile object */}
        {lastUpload && (
          <div className="mt-8 p-4 rounded-xl bg-bg-secondary border border-border-subtle">
            <h2 className="text-sm font-medium text-success mb-2">
              ✅ Upload Result
            </h2>
            <pre className="text-xs text-text-secondary overflow-auto">
              {JSON.stringify(lastUpload, null, 2)}
            </pre>
          </div>
        )}

        {lastError && (
          <div className="mt-8 p-4 rounded-xl bg-error/5 border border-error/20">
            <h2 className="text-sm font-medium text-error mb-2">
              ⚠️ Last Error
            </h2>
            <p className="text-xs text-text-secondary">{lastError}</p>
          </div>
        )}
      </div>
    </main>
  );
}
