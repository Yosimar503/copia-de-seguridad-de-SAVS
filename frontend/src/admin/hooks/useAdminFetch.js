import { useState, useEffect, useCallback } from 'react';
import { getApiErrorMessage } from '../services/client';

/**
 * Hook genérico para cargar datos en páginas del panel admin.
 * @param {() => Promise<T>} fetcher
 * @param {unknown[]} [deps]
 * @returns {{ data: T | null, loading: boolean, error: string | null, refetch: () => Promise<void> }}
 * @template T
 */
export function useAdminFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export default useAdminFetch;
