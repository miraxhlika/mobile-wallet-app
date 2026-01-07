/**
 * Core types for the Mobile Wallet app.
 *
 * ASSUMPTIONS:
 * - Balance amounts are returned as strings to avoid floating-point precision issues
 * - Transaction IDs and cursors are strings
 * - Currencies use ISO 4217 codes (e.g., "USD", "EUR")
 * - Timestamps are ISO 8601 strings
 */

// ─────────────────────────────────────────────────────────────────────────────
// Balance
// ─────────────────────────────────────────────────────────────────────────────

export interface Balance {
  currency: string;
  available: string;
  pending: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionType = "credit" | "debit" | "payout" | "refund";
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  currency: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedTransactionsResponse {
  data: Transaction[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface TransactionFilters {
  /**
   * Mock server supports filtering by wallet_id (not currency_id directly).
   * If you only have a currency, the client may translate it to a wallet_id.
   */
  walletId?: number;

  /** Mock server transaction type */
  type?: TransactionTypeApi;

  /** Mock server transaction status */
  status?: TransactionStatusApi;

  /** Full-text search on `reason` (case-insensitive) */
  search?: string;

  /** Inclusive date filters. The mock server accepts any string parsable by `new Date()` */
  dateFrom?: string;
  dateTo?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payouts
// ─────────────────────────────────────────────────────────────────────────────

export interface PayoutRequest {
  amount: string;
  currency: string;
  recipientName: string;
  recipientAccount: string;
  description?: string;
}

export interface PayoutResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  amount: string;
  currency: string;
  recipientName: string;
  recipientAccount: string;
  description?: string;
  createdAt: string;
  estimatedArrival?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Error
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  type: "network" | "http" | "unknown";
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock API (./mock-server/mock-server.js) exact shapes
// ─────────────────────────────────────────────────────────────────────────────

export type ApiSuccessType = "general_success";

export interface ApiEnvelope<TData> {
  data: TData;
  message: unknown;
  status: number;
  type: ApiSuccessType | string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth (Mock API)
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthLoginRequestApi {
  email: string;
  password: string;
}

export interface AuthLoginResponseApi {
  auth: {
    access_token: string;
    access_token_expire: string;
    refresh_token: string;
    refresh_token_expire: string;
  };
  tfa: {
    enabled: boolean;
    type: null | string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Balances / Wallets (Mock API)
// ─────────────────────────────────────────────────────────────────────────────

export interface WalletBalanceApi {
  id: number;
  user_id: string;
  currency_id: number;
  available_balance: string;
  current_balance: string;
  reserved_balance: string;
  reference_number: string;
}

export type BalancesResponseApi = ApiEnvelope<WalletBalanceApi[]>;

// ─────────────────────────────────────────────────────────────────────────────
// Transactions (Mock API)
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionTypeApi = "top-up" | "withdrawal";
export type TransactionStatusApi = "pending" | "completed" | "failed";

export interface TransactionApi {
  /**
   * NOTE: Seed transactions in the mock server DO NOT include `id`.
   * Payout-created transactions include `id` (number).
   */
  id?: number;
  wallet_id: number;
  type: TransactionTypeApi;
  status: TransactionStatusApi;
  reason: string;
  amount: number;
  currency_id: number;
  created_at: string;

  // Only present for payout-created transactions
  provider?: "bank" | "card";
  bank_id?: number | null;
}

export interface TransactionsPageApi {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more: boolean;
  items: TransactionApi[];
}

export type TransactionsResponseApi = ApiEnvelope<TransactionsPageApi>;

// ─────────────────────────────────────────────────────────────────────────────
// Payouts (Mock API)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePayoutRequestApi {
  wallet_id: number;
  provider: "bank" | "card";
  amount: number;
  currency_id: number;
  bank_id?: number;
}

export interface CreatePayoutResponseDataApi {
  id: number;
  status: TransactionStatusApi;
  amount: number;
  provider: "bank" | "card";
  wallet_id: number;
  currency_id: number;
  created_at: string;
}

export type CreatePayoutResponseApi = ApiEnvelope<CreatePayoutResponseDataApi>;
