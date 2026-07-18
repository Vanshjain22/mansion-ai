/*
 * UPLOAD TYPES
 *
 * These types define the "contract" for the entire upload system.
 * Every layer (validator, compressor, service, hook, component) imports
 * from this single file. This means:
 * 
 * 1. Changing a type here immediately shows compile errors everywhere
 *    it's used — you can't forget to update a consumer.
 * 2. No circular dependencies — types flow outward, never import logic.
 *
 * DISCRIMINATED UNION PATTERN (UploadState):
 * Instead of { status: string; progress?: number; error?: string },
 * we use a union where each status has exactly the fields that exist
 * in that state. TypeScript enforces that you can't access `error`
 * when status is 'uploading', or `progress` when status is 'idle'.
 * This makes impossible states UNREPRESENTABLE at the type level.
 */

/** The phases of the upload pipeline, in order */
export type UploadStatus =
  | "idle"
  | "validating"
  | "compressing"
  | "uploading"
  | "success"
  | "error";

/**
 * Discriminated union representing every possible state of an upload.
 * The `status` field is the discriminant — TypeScript narrows the type
 * based on which status you check.
 *
 * Example:
 *   if (state.status === 'uploading') {
 *     console.log(state.progress); // ✅ TypeScript knows progress exists
 *     console.log(state.file);     // ❌ Compile error — file doesn't exist here
 *   }
 */
export type UploadState =
  | { status: "idle" }
  | { status: "validating"; previewUrl: string }
  | { status: "compressing"; previewUrl: string; progress: number }
  | { status: "uploading"; previewUrl: string; progress: number }
  | { status: "success"; previewUrl: string; file: UploadedFile }
  | { status: "error"; error: string; previewUrl?: string };

/** Metadata about a successfully uploaded file */
export interface UploadedFile {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}

/** Configuration for the upload pipeline */
export interface UploadConfig {
  /** Maximum file size in megabytes (before compression). Default: 5 */
  maxSizeMB?: number;
  /** Allowed MIME types. Default: JPEG, PNG, WebP */
  acceptedTypes?: readonly string[];
  /** Target file size after compression in MB. Default: 1 */
  compressionTargetMB?: number;
  /** Max image dimension (width or height) after compression. Default: 2048 */
  compressionMaxDimension?: number;
}

/** Response from the presigned URL endpoint */
export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
}

/** Structured validation error with machine-readable code */
export interface UploadValidationError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "NO_FILE";
  message: string;
}
