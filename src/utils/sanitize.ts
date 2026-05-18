/**
 * FBEconnect – XSS / HTML Sanitization Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * Use these utilities whenever user-generated content must be rendered as HTML.
 *
 * RULE: Never use React's dangerouslySetInnerHTML without first calling
 * sanitizeHtml() on the content. This is enforced by convention — there is
 * no automated linting rule yet (see: TODO below).
 *
 * ⚠️ BACKEND: Content stored in the database must ALSO be sanitized server-side
 * before storage, using a library such as sanitize-html (Node.js) inside an
 * Edge Function. Never trust frontend sanitization alone.
 *
 * TODO: Add eslint-plugin-no-unsanitized to block raw dangerouslySetInnerHTML.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import DOMPurify from "dompurify";

// ── Config ────────────────────────────────────────────────────────────────────

/**
 * Strict DOMPurify config — strips everything except safe inline formatting.
 * Use this for user bios, product descriptions, and chat messages.
 */
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "br", "p", "span"],
  ALLOWED_ATTR: [],
};

/**
 * Rich DOMPurify config — allows more tags for expert knowledge articles.
 * Still blocks all scripts, event handlers, and external resources.
 */
const RICH_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "b", "i", "em", "strong", "u", "br", "p", "span",
    "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "code", "pre",
  ],
  ALLOWED_ATTR: ["class"],
  FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Sanitizes a string of HTML for safe rendering via dangerouslySetInnerHTML.
 *
 * @example
 * // ✅ Safe usage
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
 *
 * // ❌ Never do this
 * <div dangerouslySetInnerHTML={{ __html: userContent }} />
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, STRICT_CONFIG) as string;
}

/**
 * Sanitizes HTML with a richer allowed tag set (for long-form content).
 * Use for Expert Knowledge articles, not for user messages.
 */
export function sanitizeRichHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, RICH_CONFIG) as string;
}

/**
 * Strips ALL HTML from a string and returns plain text only.
 * Use when you want to display user HTML input as readable text.
 */
export function stripHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as string;
}

/**
 * Sanitizes a URL to prevent javascript: protocol injection.
 * Use for any href or src that comes from user input.
 *
 * ⚠️ BACKEND: Validate URLs server-side before storing them.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  // Block javascript:, data:, vbscript: and other dangerous schemes
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return "#";
  }
  return trimmed;
}
