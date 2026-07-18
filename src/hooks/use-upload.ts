"use client";

import { useCallback, useRef, useState } from "react";
import { validateFile } from "@/lib/upload/validator";
import { compressImage, getCompressionOptions } from "@/lib/upload/compressor";
import { requestPresignedUrl, uploadToStorage } from "@/lib/upload/service";
import type { UploadConfig, UploadedFile, UploadState } from "@/lib/upload/types";

/**
 * useUpload — Orchestrates the full upload pipeline.
 *
 * This hook is the CONDUCTOR of the upload system. It doesn't know
 * HOW to validate, compress, or upload — it delegates to the service layer.
 * It knows the ORDER and manages the STATE MACHINE.
 *
 * Pipeline: idle → validating → compressing → uploading → success
 *                       ↓             ↓            ↓
 *                     error         error        error
 *
 * HOOK vs SERVICE — What goes where?
 *
 * Hook (here):
 * - React state management (useState, useCallback)
 * - Pipeline orchestration (which step runs next)
 * - Preview URL lifecycle (create on start, revoke on cleanup)
 *
 * Service (lib/upload/):
 * - Network requests (presigned URL, XHR upload)
 * - File processing (validation, compression)
 * - Zero React dependencies — testable with plain Jest
 */

const DEFAULT_CONFIG: Required<UploadConfig> = {
  maxSizeMB: 5,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  compressionTargetMB: 1,
  compressionMaxDimension: 2048,
};

interface UseUploadReturn {
  state: UploadState;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
  removeFile: () => void;
}

export function useUpload(userConfig?: UploadConfig): UseUploadReturn {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // Track the current preview URL so we can revoke it on cleanup.
  // URL.createObjectURL creates a blob URL that holds a reference to the
  // file in memory. If we don't revoke it, the memory is never freed.
  const previewUrlRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      // Clean up any previous preview URL
      revokePreview();

      // Create instant preview using blob URL (no upload needed for preview)
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;

      try {
        // ── Step 1: Validate ──
        setState({ status: "validating", previewUrl });

        const validationError = validateFile(file, config);
        if (validationError) {
          setState({
            status: "error",
            error: validationError.message,
            previewUrl,
          });
          return;
        }

        // ── Step 2: Compress ──
        setState({ status: "compressing", previewUrl, progress: 0 });

        const compressionOpts = getCompressionOptions(config);
        const compressedFile = await compressImage(file, {
          ...compressionOpts,
          onProgress: (progress) => {
            setState({ status: "compressing", previewUrl, progress });
          },
        });

        // ── Step 3: Get Presigned URL ──
        setState({ status: "uploading", previewUrl, progress: 0 });

        const { presignedUrl, publicUrl, key } = await requestPresignedUrl(
          compressedFile.name,
          compressedFile.type
        );

        // ── Step 4: Upload to Storage ──
        await uploadToStorage(
          presignedUrl,
          compressedFile,
          compressedFile.type,
          (progress) => {
            setState({ status: "uploading", previewUrl, progress });
          }
        );

        // ── Step 5: Success ──
        const uploadedFile: UploadedFile = {
          url: publicUrl,
          key,
          name: file.name,
          size: compressedFile.size,
          type: compressedFile.type,
        };

        setState({ status: "success", previewUrl, file: uploadedFile });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during upload.";

        setState({ status: "error", error: message, previewUrl });
      }
    },
    [config, revokePreview]
  );

  const reset = useCallback(() => {
    revokePreview();
    setState({ status: "idle" });
  }, [revokePreview]);

  const removeFile = useCallback(() => {
    revokePreview();
    setState({ status: "idle" });
  }, [revokePreview]);

  return { state, processFile, reset, removeFile };
}
