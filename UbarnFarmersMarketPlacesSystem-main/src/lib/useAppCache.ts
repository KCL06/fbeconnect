import { useState, useEffect } from 'react';

// A simple global memory cache that persists across tab changes
const globalCache = new Map<string, any>();

/**
 * A lightweight custom hook for instantaneous tab switching.
 * Follows the "Stale-While-Revalidate" pattern.
 * 
 * @param key Unique cache key (e.g., `dashboard_stats_${user.id}`)
 * @param fetcher Async function that returns the data
 * @param deps Dependencies that should trigger a re-fetch (e.g., [user?.id])
 */
export function useAppCache<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  // If no key is provided, we default to null state
  const [data, setData] = useState<T | null>(() => key ? (globalCache.get(key) || null) : null);
  
  // If we already have data in cache, don't show loading spinner!
  const [isLoading, setIsLoading] = useState<boolean>(() => key ? !globalCache.has(key) : true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If key is null or dependencies are missing, don't fetch
    if (!key || deps.some((d) => d === null || d === undefined)) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      // Only set loading to true if we don't have cached data yet
      if (!globalCache.has(key)) {
        setIsLoading(true);
      }
      
      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
          // Update the global cache silently in the background
          globalCache.set(key, result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
          console.error(`[useAppCache] Error fetching ${key}:`, err);
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

  // Expose a mutate function to manually update the cache and UI
  // useful for optimistic updates after adding/deleting data
  const mutate = (newData: T | ((prev: T | null) => T)) => {
    if (!key) return;
    setData((prev) => {
      const resolvedData = typeof newData === "function" ? (newData as any)(prev) : newData;
      globalCache.set(key, resolvedData);
      return resolvedData;
    });
  };

  const refetch = async () => {
    if (!key) return;
    setIsLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      globalCache.set(key, result);
    } catch (err: any) {
      setError(err);
      console.error(`[useAppCache] Error refetching ${key}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, mutate, refetch };
}
