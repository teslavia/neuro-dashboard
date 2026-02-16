"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiQueryOptions<T> {
  fetcher: () => Promise<T>;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useApiQuery<T>({
  fetcher,
  refreshInterval,
  enabled = true,
}: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refetch();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(refetch, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [enabled, refetch, refreshInterval]);

  return { data, error, isLoading, refetch };
}
