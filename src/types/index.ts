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
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: string;
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
