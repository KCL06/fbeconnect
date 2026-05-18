/**
 * FBEconnect – Client-Side Rate Limiting Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a simple client-side throttle for high-risk actions:
 *   - Login attempts
 *   - Password reset requests
 *   - OTP / verification code sends
 *
 * Uses sessionStorage to persist attempt counts across re-renders while
 * clearing them when the browser session ends.
 *
 * ⚠️ IMPORTANT: Client-side rate limiting is a UX measure only.
 * It CAN be bypassed by clearing sessionStorage.
 *
 * ⚠️ BACKEND: Implement real rate limiting server-side using:
 *   - Supabase Edge Function middleware
 *   - Vercel Edge Middleware (rate-limit by IP)
 *   - Or a service like Upstash Redis with rate-limit helpers
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_LOCKOUT_SECONDS,
  LOGIN_ATTEMPT_WINDOW_MS,
} from "../utils/constants";

interface AttemptRecord {
  attempts: number;
  windowStart: number;
  lockedUntil: number | null;
}

function getRecord(key: string): AttemptRecord {
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) return JSON.parse(stored) as AttemptRecord;
  } catch {
    // Ignore parse errors
  }
  return { attempts: 0, windowStart: Date.now(), lockedUntil: null };
}

function saveRecord(key: string, record: AttemptRecord): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(record));
  } catch {
    // sessionStorage might be unavailable in private browsing — fail silently
  }
}

interface UseRateLimitOptions {
  /** sessionStorage key — use a unique string per action (e.g. "login_attempts") */
  storageKey: string;
  maxAttempts?: number;
  lockoutSeconds?: number;
  windowMs?: number;
}

interface UseRateLimitReturn {
  isThrottled: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
  recordAttempt: () => void;
  reset: () => void;
}

export function useRateLimit({
  storageKey,
  maxAttempts = LOGIN_MAX_ATTEMPTS,
  lockoutSeconds = LOGIN_LOCKOUT_SECONDS,
  windowMs = LOGIN_ATTEMPT_WINDOW_MS,
}: UseRateLimitOptions): UseRateLimitReturn {
  const [tick, setTick] = useState(0); // forces re-render every second when throttled

  // Refresh remaining seconds every second while locked
  useEffect(() => {
    const record = getRecord(storageKey);
    if (record.lockedUntil && record.lockedUntil > Date.now()) {
      const interval = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [storageKey, tick]);

  const record = getRecord(storageKey);
  const now = Date.now();

  // Reset window if expired
  const isWindowExpired = now - record.windowStart > windowMs;
  const effectiveRecord = isWindowExpired
    ? { attempts: 0, windowStart: now, lockedUntil: null }
    : record;

  const isThrottled =
    !!effectiveRecord.lockedUntil && effectiveRecord.lockedUntil > now;

  const remainingSeconds = isThrottled
    ? Math.ceil(((effectiveRecord.lockedUntil ?? 0) - now) / 1000)
    : 0;

  const attemptsLeft = Math.max(0, maxAttempts - effectiveRecord.attempts);

  const recordAttempt = useCallback(() => {
    const current = getRecord(storageKey);
    const nowTs = Date.now();
    const windowExpired = nowTs - current.windowStart > windowMs;

    const base: AttemptRecord = windowExpired
      ? { attempts: 0, windowStart: nowTs, lockedUntil: null }
      : { ...current };

    base.attempts += 1;

    if (base.attempts >= maxAttempts) {
      base.lockedUntil = nowTs + lockoutSeconds * 1000;
    }

    saveRecord(storageKey, base);
    setTick((t) => t + 1);
  }, [storageKey, maxAttempts, lockoutSeconds, windowMs]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    setTick((t) => t + 1);
  }, [storageKey]);

  return { isThrottled, remainingSeconds, attemptsLeft, recordAttempt, reset };
}
