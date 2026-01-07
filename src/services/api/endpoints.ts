/**
 * API endpoint definitions and request functions.
 * 
 * ASSUMPTIONS:
 * - Balances endpoint returns an array of Balance objects
 * - Transactions endpoint supports cursor-based pagination with limit param
 * - Payout endpoint accepts PayoutRequest and returns PayoutResponse
 */

import { api } from './client';
import type {
  Balance,
  PaginatedTransactionsResponse,
  TransactionFilters,
  PayoutRequest,
  PayoutResponse,
  Transaction,
} from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Balances
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchBalances(): Promise<Balance[]> {
  return api.get<Balance[]>('/balances');
}

// ─────────────────────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────────────────────

interface FetchTransactionsParams {
  cursor?: string;
  limit?: number;
  filters?: TransactionFilters;
}

export async function fetchTransactions(
  params: FetchTransactionsParams = {}
): Promise<PaginatedTransactionsResponse> {
  const { cursor, limit = 10, filters } = params;
  
  const queryParams = new URLSearchParams();
  
  if (cursor) queryParams.set('cursor', cursor);
  if (limit) queryParams.set('limit', String(limit));
  if (filters?.type) queryParams.set('type', filters.type);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.currency) queryParams.set('currency', filters.currency);
  
  const queryString = queryParams.toString();
  const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;
  
  return api.get<PaginatedTransactionsResponse>(endpoint);
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  return api.get<Transaction>(`/transactions/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Payouts
// ─────────────────────────────────────────────────────────────────────────────

export async function createPayout(data: PayoutRequest): Promise<PayoutResponse> {
  return api.post<PayoutResponse>('/payouts', data);
}

