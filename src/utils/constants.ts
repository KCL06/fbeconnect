/**
 * FBEconnect – Application-wide Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * Central source of truth for security-sensitive limits, allowed types, and
 * configuration values. Changing a value here propagates to all consumers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Password Policy ───────────────────────────────────────────────────────────
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
// Applied only to NEW registrations and password resets – existing sessions unaffected.
export const PASSWORD_REQUIRES_UPPERCASE = true;
export const PASSWORD_REQUIRES_NUMBER = true;

// ── Phone Validation ──────────────────────────────────────────────────────────
// Supports Kenyan formats: 07XXXXXXXX or +2547XXXXXXXX or 2547XXXXXXXX
export const PHONE_REGEX = /^(\+?254|0)7\d{8}$/;

// ── Text Limits ───────────────────────────────────────────────────────────────
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 2000;
export const DESCRIPTION_MAX_LENGTH = 500;
export const REFERENCE_MAX_LENGTH = 200;

// ── File Upload Security ──────────────────────────────────────────────────────
/** Maximum file size in megabytes for identity/verification documents */
export const MAX_FILE_SIZE_MB = 5;
/** Maximum file size in megabytes for farm images */
export const MAX_IMAGE_SIZE_MB = 8;

/**
 * Allowed MIME types for image uploads.
 * NOTE: Always validate MIME via magic bytes on the server too.
 */
export const ALLOWED_IMAGE_TYPES: string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Allowed MIME types for document uploads (ID documents).
 * Includes PDF in addition to images.
 */
export const ALLOWED_DOCUMENT_TYPES: string[] = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
];

/**
 * Explicitly blocked MIME types – executable/dangerous content.
 * ⚠️ BACKEND: Also validate MIME server-side before storing to Supabase Storage.
 */
export const BLOCKED_MIME_TYPES: string[] = [
  "application/x-executable",
  "application/x-msdownload",
  "application/x-sh",
  "application/x-bat",
  "application/octet-stream",
  "text/x-php",
  "application/x-httpd-php",
  "application/javascript",
  "text/javascript",
];

/**
 * Blocked file extensions (secondary check after MIME).
 * ⚠️ BACKEND: Also verify extensions server-side.
 */
export const BLOCKED_EXTENSIONS: string[] = [
  ".exe", ".sh", ".bat", ".cmd", ".php", ".py",
  ".rb", ".pl", ".js", ".ts", ".jsx", ".tsx",
  ".html", ".htm", ".svg", ".xml",
];

// ── Rate Limiting ─────────────────────────────────────────────────────────────
/** Max failed login attempts before temporary lock */
export const LOGIN_MAX_ATTEMPTS = 5;
/** Lockout duration in seconds after max attempts reached */
export const LOGIN_LOCKOUT_SECONDS = 30;
/** Window in milliseconds to count attempts within */
export const LOGIN_ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/** Resend cooldown in seconds for password reset emails */
export const PASSWORD_RESET_COOLDOWN_SECONDS = 60;
/** Max resend attempts for password reset */
export const PASSWORD_RESET_MAX_RESENDS = 3;
/** Extended cooldown after max resends */
export const PASSWORD_RESET_EXTENDED_COOLDOWN_SECONDS = 120;

// ── API / Network ─────────────────────────────────────────────────────────────
/** Default timeout in milliseconds for Supabase queries */
export const API_TIMEOUT_MS = 10_000; // 10 seconds

// ── User Roles ────────────────────────────────────────────────────────────────
export const USER_ROLES = ["farmer", "buyer", "expert", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ── Public Routes (accessible without authentication) ─────────────────────────
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/register/farmer",
  "/register/buyer",
  "/register/expert",
  "/forgot-password",
  "/update-password",
  "/privacy",
  "/terms",
] as const;
