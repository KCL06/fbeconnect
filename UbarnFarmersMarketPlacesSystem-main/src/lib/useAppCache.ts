import { useState, useEffect } from 'react';

/**
 * FBEconnect – Global App Cache (Stale-While-Revalidate)
 * ─────────────────────────────────────────────────────────────────────────────
 * A simple in-memory cache Map that persists across React component mounts and
 * tab switches. Data survives navigation; the browser tab close clears it.
 *
 * Exports:
 *   useAppCache  – React hook for data fetching with SWR caching
 *   prewarm      – Silently populate the cache before a user visits a page
 *   clearCache   – Remove a specific key (or all keys) from the cache
 * ─────────────────────────────────────────────────────────────────────────────
 */

const globalCache = new Map<string, any>();

// ── Standalone helpers (usable outside React components) ─────────────────────

/**
 * Silently pre-populate the cache with data before the user navigates to a page.
 * If the key is already cached, this is a no-op (no redundant network call).
 * Safe to call multiple times — idempotent.
 */
export async function prewarm<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
  if (globalCache.has(key)) return; // Already warm, skip
  try {
    const data = await fetcher();
    globalCache.set(key, data);
  } catch {
    // Silently fail — prewarm is best-effort; the page will fetch fresh on mount
  }
}

/**
 * Remove a specific cache entry, or clear all entries if no key is provided.
 * Call this after mutations (add/delete/update) to force the next visit to
 * re-fetch fresh data.
 */
export function clearCache(key?: string): void {
  if (key) {
    globalCache.delete(key);
  } else {
    globalCache.clear();
  }
}

// ── React hook ────────────────────────────────────────────────────────────────

/**
 * A lightweight React hook implementing Stale-While-Revalidate caching.
 *
 * Behaviour:
 *   - If data is already in the cache → renders IMMEDIATELY (zero loading state)
 *     and silently re-validates in the background.
 *   - If data is NOT in the cache → shows loading state, fetches, then caches.
 *
 * @param key     Unique cache key. Pass `null` to skip fetching (e.g., when
 *                required IDs are not yet available).
 * @param fetcher Async function that returns the data.
 * @param deps    Extra dependencies that should trigger a re-fetch (e.g., `[user?.id]`).
 */
export function useAppCache<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  // Initialise state directly from cache — avoids the loading flash entirely
  const [data, setData] = useState<T | null>(() =>
    key ? (globalCache.get(key) ?? null) : null
  );

  // Only show loading if we have NO cached data at all
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    key ? !globalCache.has(key) : false
  );

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if key is null or any dependency is missing
    if (!key || deps.some((d) => d === null || d === undefined)) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      // Only show a spinner if we have NO cached data (first-ever visit to this page)
      if (!globalCache.has(key)) {
        setIsLoading(true);
      }

      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
          globalCache.set(key, result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
          console.error(`[useAppCache] Error fetching "${key}":`, err?.message ?? err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);

  /**
   * Optimistically update the UI and cache without re-fetching.
   * Useful after add/edit/delete operations.
   */
  const mutate = (newData: T | ((prev: T | null) => T)): void => {
    if (!key) return;
    setData((prev) => {
      const resolved =
        typeof newData === 'function' ? (newData as (p: T | null) => T)(prev) : newData;
      globalCache.set(key, resolved);
      return resolved;
    });
  };

  /**
   * Force a fresh network fetch and update both the UI and the cache.
   * Call this after mutations that require server-confirmed state.
   */
  const refetch = async (): Promise<void> => {
    if (!key) return;
    setIsLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      globalCache.set(key, result);
    } catch (err: any) {
      setError(err);
      console.error(`[useAppCache] Error refetching "${key}":`, err?.message ?? err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, mutate, refetch };
}
