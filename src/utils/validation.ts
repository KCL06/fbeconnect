/**
 * FBEconnect – Reusable Validation Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * These are FRONTEND validators only. They improve UX but do NOT replace
 * server-side validation.
 *
 * ⚠️ BACKEND: All user inputs must ALSO be validated server-side via:
 *   - Supabase Row-Level Security (RLS) policies
 *   - Supabase Edge Functions / Database Functions
 *   - Supabase Auth password policies (min length in project settings)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_REQUIRES_NUMBER,
  PASSWORD_REQUIRES_UPPERCASE,
  PHONE_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from "./constants";

// ── Email ─────────────────────────────────────────────────────────────────────

/**
 * Validates an email address using RFC-5321-compatible regex.
 * ⚠️ BACKEND: Supabase also validates email format on signup.
 */
export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Standard email regex – covers the vast majority of real addresses
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return EMAIL_REGEX.test(trimmed);
}

// ── Password ──────────────────────────────────────────────────────────────────

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

/**
 * Validates a password against the app's password policy.
 * Applied to: new registrations and password resets.
 * ⚠️ BACKEND: Also configure Supabase Auth → Password Strength in the dashboard.
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    return { valid: false, errors: ["Password is required"], strength: "weak" };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`);
  }
  if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (PASSWORD_REQUIRES_NUMBER && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Strength calculation (independent of validity)
  let strength: PasswordValidationResult["strength"] = "weak";
  const strengthScore =
    (password.length >= PASSWORD_MIN_LENGTH ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0) +
    (password.length >= 12 ? 1 : 0);

  if (strengthScore >= 4) strength = "strong";
  else if (strengthScore >= 2) strength = "medium";

  return { valid: errors.length === 0, errors, strength };
}

/**
 * Quick check — passwords match.
 */
export function passwordsMatch(password: string, confirm: string): boolean {
  return password === confirm;
}

// ── Phone ─────────────────────────────────────────────────────────────────────

/**
 * Validates a phone number (Kenyan format supported).
 * Accepts: 0712345678, +254712345678, 254712345678
 * ⚠️ BACKEND: Validate and normalise phone numbers server-side before storing.
 */
export function validatePhone(phone: string): boolean {
  const trimmed = phone.trim().replace(/\s+/g, "");
  if (!trimmed) return false;
  return PHONE_REGEX.test(trimmed);
}

// ── Name / Text ───────────────────────────────────────────────────────────────

/**
 * Validates a person's full name.
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: "Name is required" };
  if (trimmed.length < NAME_MIN_LENGTH) {
    return { valid: false, error: `Name must be at least ${NAME_MIN_LENGTH} characters` };
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return { valid: false, error: `Name must be at most ${NAME_MAX_LENGTH} characters` };
  }
  // Only letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { valid: false, error: "Name may only contain letters, spaces, hyphens, and apostrophes" };
  }
  return { valid: true };
}

/**
 * Validates text length (generic helper for textarea fields).
 */
export function validateTextLength(
  text: string,
  min = 0,
  max = MESSAGE_MAX_LENGTH
): { valid: boolean; error?: string } {
  if (text.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }
  if (text.length > max) {
    return { valid: false, error: `Must be at most ${max} characters` };
  }
  return { valid: true };
}

/**
 * Validates a description field.
 */
export function validateDescription(text: string): { valid: boolean; error?: string } {
  return validateTextLength(text, 10, DESCRIPTION_MAX_LENGTH);
}

// ── National ID ───────────────────────────────────────────────────────────────

/**
 * Validates a Kenyan National ID number (6–8 digits).
 * ⚠️ BACKEND: Verify ID uniqueness server-side to prevent duplicate registrations.
 */
export function validateNationalId(id: string): { valid: boolean; error?: string } {
  const trimmed = id.trim();
  if (!trimmed) return { valid: false, error: "National ID is required" };
  if (!/^\d{6,8}$/.test(trimmed)) {
    return { valid: false, error: "National ID must be 6–8 digits" };
  }
  return { valid: true };
}

// ── General Input Sanitization ────────────────────────────────────────────────

/**
 * Strips HTML special characters from plain-text inputs.
 * This prevents basic XSS injection in text fields.
 * For rendering HTML, use sanitizeHtml() from sanitize.ts instead.
 *
 * ⚠️ BACKEND: NEVER trust front-end sanitization alone. Sanitize all string
 * inputs in your Supabase Edge Functions or database triggers.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Trims whitespace and strips leading/trailing special characters from
 * user-supplied plain-text input. Safe to store as-is in the database.
 */
export function cleanInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

// ── Years of Experience ───────────────────────────────────────────────────────

export function validateYearsExperience(value: string): { valid: boolean; error?: string } {
  const num = parseInt(value, 10);
  if (isNaN(num)) return { valid: false, error: "Must be a number" };
  if (num < 0) return { valid: false, error: "Cannot be negative" };
  if (num > 80) return { valid: false, error: "Please enter a realistic value" };
  return { valid: true };
}
