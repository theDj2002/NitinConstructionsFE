import { useEffect, useRef, useCallback } from 'react';

/**
 * useAutoRefresh
 *
 * Calls `fetchFn` immediately, then again every `intervalMs`.
 * Also exposes `refresh()` so callers can trigger an immediate re-fetch
 * after a mutation (add / delete / upload).
 *
 * @param {() => Promise<void>} fetchFn   - async function that loads data into state
 * @param {number}              intervalMs - polling interval (default 30 s)
 * @returns {{ refresh: () => void }}
 */
export function useAutoRefresh(fetchFn, intervalMs = 30_000) {
  const fetchRef = useRef(fetchFn);

  // Keep ref current so the interval closure always calls the latest version
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  // Initial fetch + polling
  useEffect(() => {
    let mounted = true;

    const run = () => {
      if (mounted) fetchRef.current();
    };

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  // Manual trigger (call this after any mutation)
  const refresh = useCallback(() => {
    fetchRef.current();
  }, []);

  return { refresh };
}
