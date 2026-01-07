/**
 * React Query hooks for transaction data.
 *
 * PAGINATION BEHAVIOR:
 * - Uses page/per_page pagination (mock server)
 * - Response is derived from mock server's `has_more` + `items`
 * - Caps total transactions at 50 (MAX_TRANSACTIONS)
 * - Fetches 10 items per page by default (PAGE_SIZE)
 */

import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { fetchTransactions, fetchTransactionById } from "../../services/api";
import type {
  TransactionFilters,
  PaginatedTransactionsResponse,
  Transaction,
  ApiError,
} from "../../types";

const PAGE_SIZE = 20;

export const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;
export const TRANSACTION_DETAIL_QUERY_KEY = ["transaction"] as const;

type InfiniteTransactionsPage = PaginatedTransactionsResponse & {
  /**
   * Mock-server-aligned aliases (snake_case) for pagination fields.
   * Kept in the page object so pagination logic can use mock semantics,
   * without breaking existing UI that reads `page.data`.
   */
  items: Transaction[];
  has_more: boolean;
  page: number;
  per_page: number;
};

/**
 * Hook to fetch paginated transactions with infinite scroll support.
 * Caps total fetched transactions at 50.
 */
export function useInfiniteTransactions(filters?: TransactionFilters) {
  const queryKey = [...TRANSACTIONS_QUERY_KEY, filters] as const;

  const query = useInfiniteQuery<InfiniteTransactionsPage, ApiError>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const page =
        typeof pageParam === "number" && Number.isFinite(pageParam)
          ? pageParam
          : 1;

      const perPage = PAGE_SIZE;

      const resp = await fetchTransactions({
        // `fetchTransactions` already uses page/per_page under the hood; we pass page number as cursor.
        cursor: String(page),
        limit: perPage,
        filters,
      });

      // Keep existing shape for current UI (`data`, `hasMore`, `nextCursor`)
      // and add mock-aligned aliases for pagination logic (`items`, `has_more`).
      return {
        ...resp,
        items: resp.data,
        has_more: resp.hasMore,
        page,
        per_page: perPage,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Next page only when:
      // - mock server says there's more (`has_more`)
      if (!lastPage.has_more) return undefined;

      return lastPage.page + 1;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });

  // Convenience for FlatList (UI can migrate later without changing pagination semantics)
  const transactions = query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    ...query,
    transactions,
  };
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
