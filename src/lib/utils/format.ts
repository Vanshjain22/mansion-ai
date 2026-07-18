/**
 * Formatting utilities for human-readable display.
 * Pure functions with zero side effects — safe to call anywhere.
 */

/**
 * Convert bytes to a human-readable file size string.
 *
 * Why not just `(bytes / 1024 / 1024).toFixed(2) + " MB"`?
 * Because a 500-byte file would show "0.00 MB" which is meaningless.
 * This function picks the right unit automatically.
 *
 * Examples:
 *   formatFileSize(0)          → "0 B"
 *   formatFileSize(1024)       → "1.0 KB"
 *   formatFileSize(1536000)    → "1.5 MB"
 *   formatFileSize(2147483648) → "2.0 GB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  // Math.log(bytes) / Math.log(1024) gives us which unit tier we're in
  // e.g., 1536000 bytes → log1024 ≈ 2.05 → floor = 2 → "MB"
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
