/**
 * FBEconnect – Centralized API / Supabase Query Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * All Supabase calls should flow through these helpers where possible to get:
 *   - Consistent timeout handling
 *   - Classified, user-friendly error messages (no stack traces leaked to UI)
 *   - Dev-only error logging
 *   - Typed responses
 *
 * ⚠️ BACKEND: Never expose raw DB error messages to users in production.
 *   Use Supabase RLS policies to prevent unauthorized data access at the DB level.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from "./supabase";
import { API_TIMEOUT_MS } from "../utils/constants";

// ── Error Classification ───────────────────────────────────────────────────────

export type ApiErrorType =
  | "network"
  | "auth"
  | "permission"
  | "not_found"
  | "validation"
  | "timeout"
  | "server"
  | "unknown";

export interface ApiError {
  type: ApiErrorType;
  message: string; // User-friendly message (safe to display)
  code?: string;   // Original error code (never shown to users)
}

/**
 * Maps a raw Supabase/network error into a user-friendly ApiError.
 * Intentionally discards stack traces and internal codes from UI display.
 */
export function classifyError(err: unknown): ApiError {
  if (!err) return { type: "unknown", message: "An unexpected error occurred." };

  const message = err instanceof Error ? err.message : String(err);
  const lowerMsg = message.toLowerCase();

  // Auth errors
  if (
    lowerMsg.includes("invalid login") ||
    lowerMsg.includes("invalid credentials") ||
    lowerMsg.includes("email not confirmed")
  ) {
    return { type: "auth", message: "Invalid email or password.", code: message };
  }
  if (lowerMsg.includes("jwt") || lowerMsg.includes("session")) {
    return { type: "auth", message: "Your session has expired. Please log in again.", code: message };
  }

  // Permission
  if (lowerMsg.includes("permission") || lowerMsg.includes("unauthorized") || lowerMsg.includes("rls")) {
    return { type: "permission", message: "You do not have permission to perform this action.", code: message };
  }

  // Not found
  if (lowerMsg.includes("not found") || lowerMsg.includes("no rows")) {
    return { type: "not_found", message: "The requested resource was not found.", code: message };
  }

  // Network
  if (lowerMsg.includes("network") || lowerMsg.includes("fetch") || lowerMsg.includes("failed to fetch")) {
    return { type: "network", message: "Network error. Please check your connection.", code: message };
  }

  // Timeout
  if (lowerMsg.includes("timeout") || lowerMsg.includes("aborted")) {
    return { type: "timeout", message: "The request timed out. Please try again.", code: message };
  }

  // Validation
  if (lowerMsg.includes("unique") || lowerMsg.includes("duplicate") || lowerMsg.includes("violates")) {
    return { type: "validation", message: "This entry already exists or conflicts with existing data.", code: message };
  }

  // Server
  if (lowerMsg.includes("500") || lowerMsg.includes("internal")) {
    return { type: "server", message: "A server error occurred. Please try again later.", code: message };
  }

  // Log full details only in development
  if (import.meta.env.DEV) {
    console.error("[FBEconnect API Error]", err);
  }

  return { type: "unknown", message: "Something went wrong. Please try again.", code: message };
}

/**
 * Returns a user-facing error message string from any error.
 */
export function getErrorMessage(err: unknown): string {
  return classifyError(err).message;
}

// ── Generic Query Wrapper ─────────────────────────────────────────────────────

export interface QueryResult<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * Wraps a Supabase query in a timeout and standardized error handling.
 *
 * @example
 * const { data, error } = await query(() =>
 *   supabase.from("products").select("*").eq("farmer_id", userId)
 * );
 */
export async function query<T>(
  fn: () => PromiseLike<{ data: T | null; error: unknown }>,
  timeoutMs = API_TIMEOUT_MS
): Promise<QueryResult<T>> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
  );

  try {
    const result = await Promise.race([fn(), timeoutPromise]) as { data: T | null; error: unknown };

    if (result.error) {
      const apiError = classifyError(result.error);
      return { data: null, error: apiError };
    }

    return { data: result.data, error: null };
  } catch (err) {
    return { data: null, error: classifyError(err) };
  }
}

// ── Convenience Helpers ────────────────────────────────────────────────────────

/**
 * Fetches a single row by ID from any table.
 * ⚠️ BACKEND: Ensure RLS policies restrict this to the authenticated user's data.
 */
export async function fetchById<T>(
  table: string,
  id: string,
  columns = "*"
): Promise<QueryResult<T>> {
  return query<T>(() =>
    supabase.from(table).select(columns).eq("id", id).single() as any
  );
}

/**
 * Fetches rows filtered by a column value.
 * ⚠️ BACKEND: RLS must enforce that users can only read their own rows.
 */
export async function fetchWhere<T>(
  table: string,
  column: string,
  value: string | number | boolean,
  columns = "*"
): Promise<QueryResult<T[]>> {
  return query<T[]>(() =>
    supabase.from(table).select(columns).eq(column, value) as any
  );
}

/**
 * Upserts a row into a table.
 * ⚠️ BACKEND: RLS must restrict upsert to the authenticated user's own data.
 */
export async function upsertRow<T extends Record<string, unknown>>(
  table: string,
  row: T
): Promise<QueryResult<T>> {
  return query<T>(() =>
    supabase.from(table).upsert(row).select().single() as any
  );
}
