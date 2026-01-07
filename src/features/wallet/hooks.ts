/**
 * React Query hooks for wallet/balance data.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchBalances } from '../../services/api';
import type { Balance, ApiError } from '../../types';

export const BALANCES_QUERY_KEY = ['balances'] as const;

/**
 * Hook to fetch and cache wallet balances
 */
export function useBalances() {
  const query = useQuery<Balance[], ApiError>({
    queryKey: BALANCES_QUERY_KEY,
    queryFn: fetchBalances,
    staleTime: 30_000, // Consider fresh for 30 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    retry: 2,
  });

  // Backwards-compatible convenience fields (UI can migrate later)
  const balances = query.data ?? [];

  return {
    ...query,
    balances,
  };
}

