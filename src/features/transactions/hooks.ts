/**
 * React Query hooks for transaction data.
 * 
 * PAGINATION BEHAVIOR:
 * - Uses cursor-based pagination
 * - Caps total transactions at 50 (MAX_TRANSACTIONS)
 * - Fetches 10 items per page by default
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchTransactions, fetchTransactionById } from '../../services/api';
import type {
  TransactionFilters,
  PaginatedTransactionsResponse,
  Transaction,
  ApiError,
} from '../../types';

const PAGE_SIZE = 10;
const MAX_TRANSACTIONS = 50;

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;
export const TRANSACTION_DETAIL_QUERY_KEY = ['transaction'] as const;

/**
 * Hook to fetch paginated transactions with infinite scroll support.
 * Caps total fetched transactions at 50.
 */
export function useInfiniteTransactions(filters?: TransactionFilters) {
  return useInfiniteQuery<PaginatedTransactionsResponse, ApiError>({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: async ({ pageParam }) => {
      return fetchTransactions({
        cursor: pageParam as string | undefined,
        limit: PAGE_SIZE,
        filters,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate total fetched so far
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0
      );
      
      // Stop if we've hit our cap or no more data
      if (totalFetched >= MAX_TRANSACTIONS || !lastPage.hasMore) {
        return undefined;
      }
      
      return lastPage.nextCursor;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransactionById(id: string) {
  return useQuery<Transaction, ApiError>({
    queryKey: [...TRANSACTION_DETAIL_QUERY_KEY, id],
    queryFn: () => fetchTransactionById(id),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

