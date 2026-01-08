/**
 * React Query hooks for transaction data.
 *
 * PAGINATION BEHAVIOR:
 * - Uses true cursor-based pagination when supported by the API (/transactions?cursor=...)
 * - Falls back to page/per_page pagination for the local mock server
 * - Caps total transactions at 50 (MAX_TRANSACTIONS)
 * - Fetches PAGE_SIZE items per page by default (but never exceeds remaining-to-50)
 */

import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { fetchTransactions, fetchTransactionById } from "../../services/api";
import type {
  TransactionFilters,
  PaginatedTransactionsResponse,
  Transaction,
  ApiError,
} from "../../types";

const PAGE_SIZE = 20;
const MAX_TRANSACTIONS = 50;

export const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;
export const TRANSACTION_DETAIL_QUERY_KEY = ["transaction"] as const;

type InfiniteTransactionsPage = PaginatedTransactionsResponse & {
  items: Transaction[];
};

type TransactionsPageParam = {
  cursor?: string | null;
  loaded: number;
};

/**
 * Hook to fetch paginated transactions with infinite scroll support.
 * Caps total fetched transactions at 50.
 */
export function useInfiniteTransactions(filters?: TransactionFilters) {
  const queryKey = [...TRANSACTIONS_QUERY_KEY, filters] as const;

  const query = useInfiniteQuery<
    InfiniteTransactionsPage,
    ApiError,
    InfiniteData<InfiniteTransactionsPage, TransactionsPageParam>,
    typeof queryKey,
    TransactionsPageParam
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const loadedSoFar = pageParam?.loaded ?? 0;
      const remaining = Math.max(0, MAX_TRANSACTIONS - loadedSoFar);
      const requested = Math.min(PAGE_SIZE, remaining);

      if (requested <= 0) {
        return { data: [], items: [], hasMore: false, nextCursor: null };
      }

      const cursor =
        pageParam?.cursor &&
        typeof pageParam.cursor === "string" &&
        pageParam.cursor.trim()
          ? pageParam.cursor
          : undefined;

      // `fetchTransactions` auto-selects cursor vs page/per_page based on environment/response.
      const resp = await fetchTransactions({
        cursor,
        limit: requested,
        filters,
      });

      return {
        ...resp,
        items: resp.data,
      };
    },
    // For cursor-based APIs, the first page has no cursor. For mock paging, fetchTransactions will map this to page=1.
    initialPageParam: { cursor: null, loaded: 0 },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      if (loaded >= MAX_TRANSACTIONS) return undefined;
      if (!lastPage.hasMore) return undefined;
      return { cursor: lastPage.nextCursor, loaded };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });

  // Convenience for FlatList (UI can migrate later without changing pagination semantics)
  const transactionsRaw = query.data?.pages.flatMap((p) => p.items) ?? [];
  // Defensive de-dupe by id to prevent React key collisions if the backend overlaps pages.
  const seen = new Set<string>();
  const transactions = transactionsRaw.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

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
