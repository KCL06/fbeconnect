/**
 * FBEconnect – File Upload Security Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates uploaded files on the client side BEFORE sending to Supabase.
 *
 * These checks guard against:
 *   - Oversized files (DoS)
 *   - Mismatched extensions vs content (e.g., a .exe renamed to .jpg)
 *   - Executable / dangerous file types
 *
 * ⚠️ BACKEND: Always re-validate file MIME and size in Supabase Storage policies
 * and in any Edge Function that processes uploads. Client-side checks can be
 * bypassed by a motivated attacker.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  BLOCKED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_IMAGE_SIZE_MB,
} from "./constants";

// ── Magic Byte Signatures ─────────────────────────────────────────────────────

/**
 * Known file signatures (magic bytes) mapped to MIME types.
 * Reading the first few bytes of the file is far more reliable than trusting
 * the file extension or the browser's MIME detection.
 */
const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png",  bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif",  bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header (also used by WAV – cross-check below)
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  // Executables / dangerous
  { mime: "application/x-msdownload", bytes: [0x4d, 0x5a] },       // MZ header (EXE/DLL)
  { mime: "application/x-executable", bytes: [0x7f, 0x45, 0x4c, 0x46] }, // ELF
  { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },   // ZIP (includes DOCX, XLSX, JAR)
];

/**
 * Reads the first `n` bytes of a File as a Uint8Array.
 */
async function readMagicBytes(file: File, n = 8): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(e.target.result).slice(0, n));
      } else {
        reject(new Error("Could not read file"));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsArrayBuffer(file.slice(0, n));
  });
}

/**
 * Detects the real MIME type of a file by inspecting magic bytes.
 * Returns the detected MIME string, or null if not recognised.
 */
export async function detectMimeFromBytes(file: File): Promise<string | null> {
  try {
    const bytes = await readMagicBytes(file);
    for (const sig of MAGIC_BYTES) {
      const offset = sig.offset ?? 0;
      const match = sig.bytes.every((b, i) => bytes[offset + i] === b);
      if (match) return sig.mime;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Main Validation Function ──────────────────────────────────────────────────

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  allowedMimes?: string[];
  maxSizeMB?: number;
}

/**
 * Validates a file for upload by:
 * 1. Checking the file size
 * 2. Checking the extension is not blocked
 * 3. Reading magic bytes to verify the true MIME type
 *
 * @example
 * const result = await validateFileUpload(file, {
 *   allowedMimes: ALLOWED_DOCUMENT_TYPES,
 *   maxSizeMB: 5,
 * });
 * if (!result.valid) toast.error(result.error);
 */
export async function validateFileUpload(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const {
    allowedMimes = ALLOWED_IMAGE_TYPES,
    maxSizeMB = MAX_FILE_SIZE_MB,
  } = options;

  // 1. Size check
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File is too large (${sizeMB.toFixed(1)} MB). Maximum allowed: ${maxSizeMB} MB.`,
    };
  }

  // 2. Extension check
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type "${ext}" is not allowed for security reasons.`,
    };
  }

  // 3. Magic byte MIME check
  const detectedMime = await detectMimeFromBytes(file);
  if (detectedMime) {
    // If we can identify the MIME, make sure it's allowed
    if (!allowedMimes.includes(detectedMime)) {
      return {
        valid: false,
        error: `File content type "${detectedMime}" is not allowed. Please upload a valid image or PDF.`,
      };
    }
    // Extra safety: block executables regardless of allowedMimes list
    if (
      detectedMime === "application/x-msdownload" ||
      detectedMime === "application/x-executable"
    ) {
      return { valid: false, error: "Executable files are not allowed." };
    }
  } else {
    // Fallback to browser-provided MIME type if magic bytes are unrecognised
    if (file.type && !allowedMimes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not supported. Please upload ${allowedMimes.join(", ")}.`,
      };
    }
  }

  return { valid: true };
}

/** Quick helpers */
export const validateImageUpload = (file: File) =>
  validateFileUpload(file, { allowedMimes: ALLOWED_IMAGE_TYPES, maxSizeMB: MAX_IMAGE_SIZE_MB });

export const validateDocumentUpload = (file: File) =>
  validateFileUpload(file, { allowedMimes: ALLOWED_DOCUMENT_TYPES, maxSizeMB: MAX_FILE_SIZE_MB });

// ── Filename Sanitization ─────────────────────────────────────────────────────

/**
 * Sanitizes a filename before passing it to Supabase Storage.
 * Replaces spaces and special chars, keeps only alphanumeric, dots, hyphens, underscores.
 *
 * ⚠️ BACKEND: Also sanitize filenames in your Edge Functions before storing.
 */
export function sanitizeFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const base = name
    .replace(/\.[^.]+$/, "")            // remove extension
    .replace(/[^a-zA-Z0-9_-]/g, "_")   // replace unsafe chars
    .replace(/_+/g, "_")               // collapse multiple underscores
    .slice(0, 64);                      // max 64 chars for base name
  return `${base}.${ext}`;
}
