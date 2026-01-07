/**
 * API endpoint definitions and request functions.
 *
 * This file parses the EXACT mock server shapes from `./mock-server/mock-server.js`
 * and maps them into the app's domain types used by the UI.
 */

import { api } from "./client";
import { saveRefreshToken } from "../../storage/secureToken";
import type {
  Balance,
  PaginatedTransactionsResponse,
  TransactionFilters,
  PayoutRequest,
  PayoutResponse,
  Transaction,
  ApiError,
  AuthTokens,
  AuthLoginResponseApi,
  BalancesResponseApi,
  WalletBalanceApi,
  TransactionsResponseApi,
  TransactionApi,
  CreatePayoutRequestApi,
  CreatePayoutResponseApi,
} from "../../types";

// Currency mapping for the mock server (currency_id -> ISO code)
const CURRENCY_ID_TO_CODE: Record<number, string> = {
  1: "USD",
  2: "EUR",
  9: "GBP",
};

const CURRENCY_CODE_TO_WALLET: Record<
  string,
  { walletId: number; currencyId: number }
> = {
  USD: { walletId: 1, currencyId: 1 },
  EUR: { walletId: 2, currencyId: 2 },
  GBP: { walletId: 3, currencyId: 9 },
};

const DEFAULT_WALLET = { walletId: 1, currencyId: 1 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function toMoneyString(value: number): string {
  // Keep 2 decimals for UI consistency
  return value.toFixed(2);
}

function currencyCodeFromId(currencyId: number): string {
  return CURRENCY_ID_TO_CODE[currencyId] ?? `CUR_${currencyId}`;
}

function deriveTransactionId(tx: TransactionApi): string {
  if (typeof tx.id === "number" && Number.isFinite(tx.id)) return String(tx.id);

  // Seed transactions have no id; derive a deterministic id
  // (stable across reloads given static mock data).
  return [
    "seed",
    tx.wallet_id,
    tx.currency_id,
    tx.type,
    tx.status,
    tx.created_at,
    tx.amount,
    tx.reason,
  ].join("|");
}

function mapWalletToBalance(wallet: WalletBalanceApi): Balance {
  return {
    currency: currencyCodeFromId(wallet.currency_id),
    available: wallet.available_balance,
    pending: wallet.reserved_balance,
  };
}

function mapTransactionApiToDomain(tx: TransactionApi): Transaction {
  const currency = currencyCodeFromId(tx.currency_id);

  // Domain mapping:
  // - top-up => credit
  // - withdrawal => payout
  // - fee => debit
  const domainType: Transaction["type"] =
    tx.type === "top-up" ? "credit" : tx.type === "fee" ? "debit" : "payout";

  const absAmount = Math.abs(tx.amount);

  return {
    id: deriveTransactionId(tx),
    type: domainType,
    status:
      tx.status === "completed"
        ? "completed"
        : tx.status === "failed"
        ? "failed"
        : tx.status === "cancelled"
        ? "cancelled"
        : "pending",
    amount: toMoneyString(absAmount),
    currency,
    description: tx.reason,
    createdAt: tx.created_at,
    updatedAt: tx.created_at,
    metadata: {
      walletId: tx.wallet_id,
      currencyId: tx.currency_id,
      provider: tx.provider,
      bankId: tx.bank_id,
      raw: tx,
    },
  };
}

function parseBalancesResponse(raw: unknown): WalletBalanceApi[] {
  if (!isRecord(raw)) return [];
  const data = raw["data"];
  const arr = asArray(data);
  if (!arr) return [];

  // Be defensive: only accept objects with the expected keys
  const wallets: WalletBalanceApi[] = [];
  for (const item of arr) {
    if (!isRecord(item)) continue;
    const id = asNumber(item["id"]);
    const user_id = asString(item["user_id"]);
    const currency_id = asNumber(item["currency_id"]);
    const available_balance = asString(item["available_balance"]);
    const current_balance = asString(item["current_balance"]);
    const reserved_balance = asString(item["reserved_balance"]);
    const reference_number = asString(item["reference_number"]);

    if (
      id === undefined ||
      !user_id ||
      currency_id === undefined ||
      !available_balance ||
      !current_balance ||
      !reserved_balance ||
      !reference_number
    ) {
      continue;
    }

    wallets.push({
      id,
      user_id,
      currency_id,
      available_balance,
      current_balance,
      reserved_balance,
      reference_number,
    });
  }

  return wallets;
}

function parseTransactionsResponse(raw: unknown): {
  page: number;
  perPage: number;
  hasMore: boolean;
  items: TransactionApi[];
} {
  if (!isRecord(raw)) return { page: 1, perPage: 15, hasMore: false, items: [] };
  const data = raw["data"];
  if (!isRecord(data)) return { page: 1, perPage: 15, hasMore: false, items: [] };

  const page = asNumber(data["current_page"]) ?? 1;
  const perPage = asNumber(data["per_page"]) ?? 15;
  const hasMore = asBoolean(data["has_more"]) ?? false;
  const itemsRaw = data["items"];
  const arr = asArray(itemsRaw) ?? [];

  const items: TransactionApi[] = [];
  for (const item of arr) {
    if (!isRecord(item)) continue;

    const wallet_id = asNumber(item["wallet_id"]);
    const type = asString(item["type"]);
    const status = asString(item["status"]);
    const reason = asString(item["reason"]);
    const amount = asNumber(item["amount"]);
    const currency_id = asNumber(item["currency_id"]);
    const created_at = asString(item["created_at"]);

    if (
      wallet_id === undefined ||
      !type ||
      !status ||
      !reason ||
      amount === undefined ||
      currency_id === undefined ||
      !created_at
    ) {
      continue;
    }

    // Validate mock server enums
    if (type !== "top-up" && type !== "withdrawal" && type !== "fee") continue;
    if (
      status !== "pending" &&
      status !== "completed" &&
      status !== "failed" &&
      status !== "cancelled"
    )
      continue;

    // Optional fields
    const id = asNumber(item["id"]);
    const provider = asString(item["provider"]);
    const bank_id = asNumber(item["bank_id"]);

    items.push({
      id: id ?? undefined,
      wallet_id,
      type: type as TransactionApi["type"],
      status: status as TransactionApi["status"],
      reason,
      amount,
      currency_id,
      created_at,
      provider: provider as TransactionApi["provider"],
      bank_id: bank_id ?? (item["bank_id"] === null ? null : undefined),
    });
  }

  return { page, perPage, hasMore, items };
}

// ─────────────────────────────────────────────────────────────────────────────
// Balances
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchBalances(): Promise<Balance[]> {
  const raw = await api.get<unknown>("/balances");
  // Exact mock server envelope is BalancesResponseApi, but parse defensively.
  const wallets = parseBalancesResponse(raw as BalancesResponseApi);
  return wallets.map(mapWalletToBalance);
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

  const pageNum = cursor ? Number.parseInt(cursor, 10) : 1;
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const perPage = Math.max(1, Math.min(limit, 50)); // defensive

  // Mock server supports: page, per_page, wallet_id, type, status, date_from, date_to, search
  const query: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
  };

  if (filters?.walletIds?.length) query.wallet_id = filters.walletIds.join(",");
  if (filters?.types?.length) query.type = filters.types.join(",");
  if (filters?.statuses?.length) query.status = filters.statuses.join(",");
  if (filters?.dateFrom) query.date_from = filters.dateFrom;
  if (filters?.dateTo) query.date_to = filters.dateTo;
  if (filters?.search) query.search = filters.search;

  const qs = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const raw = await api.get<unknown>(`/transactions?${qs}`);
  const parsed = parseTransactionsResponse(raw as TransactionsResponseApi);

  const domainItems = parsed.items.map(mapTransactionApiToDomain);
  const hasMore = parsed.hasMore;
  const nextCursor = hasMore ? String(parsed.page + 1) : null;

  return {
    data: domainItems,
    nextCursor,
    hasMore,
  };
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  // Mock server does not expose /transactions/:id. Fetch pages until found.
  let cursor: string | undefined = "1";
  for (let i = 0; i < 10; i++) {
    const page = await fetchTransactions({ cursor, limit: 50 });
    const found = page.data.find((t) => t.id === id);
    if (found) return found;
    if (!page.hasMore || !page.nextCursor) break;
    cursor = page.nextCursor;
  }

  const err: ApiError = {
    type: "http",
    message: "Transaction not found",
    statusCode: 404,
  };
  throw err;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payouts
// ─────────────────────────────────────────────────────────────────────────────

export async function createPayout(data: PayoutRequest): Promise<PayoutResponse> {
  const amountNum = Number.parseFloat(data.amount);
  const amount = Number.isFinite(amountNum) ? amountNum : NaN;
  if (!Number.isFinite(amount) || amount <= 0) {
    const err: ApiError = { type: "unknown", message: "Invalid payout amount" };
    throw err;
  }

  const wallet =
    CURRENCY_CODE_TO_WALLET[data.currency?.toUpperCase()] ?? DEFAULT_WALLET;

  // Map UI payout request -> mock server request shape
  const body: CreatePayoutRequestApi = {
    wallet_id: wallet.walletId,
    currency_id: wallet.currencyId,
    provider: "bank",
    bank_id: 1,
    amount,
  };

  const raw = await api.post<unknown>("/payouts", body);

  // Parse response defensively
  const envelope = raw as CreatePayoutResponseApi;
  const responseData = isRecord(envelope) && isRecord(envelope.data) ? envelope.data : null;

  const payoutId =
    responseData && asNumber(responseData["id"]) !== undefined
      ? String(responseData["id"])
      : `mock_payout_${Date.now()}`;

  const status =
    responseData && asString(responseData["status"])
      ? (responseData["status"] as PayoutResponse["status"])
      : "pending";

  const createdAt =
    responseData && asString(responseData["created_at"])
      ? (responseData["created_at"] as string)
      : new Date().toISOString();

  return {
    id: payoutId,
    status,
    amount: toMoneyString(Math.abs(amountNum || 0)),
    currency: data.currency,
    recipientName: data.recipientName,
    recipientAccount: data.recipientAccount,
    description: data.description,
    createdAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthTokens> {
  const raw = await api.post<unknown>(
    "/auth/login",
    { email, password },
    { skipAuth: true }
  );

  if (!isRecord(raw) || !isRecord(raw["auth"])) {
    throw {
      type: "unknown",
      message: "Unexpected login response shape",
    };
  }

  const auth = raw["auth"] as AuthLoginResponseApi["auth"];
  const accessToken = asString(auth.access_token);
  const refreshToken = asString(auth.refresh_token);
  const expiresAt = asString(auth.access_token_expire);

  if (!accessToken) {
    throw {
      type: "unknown",
      message: "Login response missing access_token",
    };
  }

  // Store refresh token if present (access token is stored by authStore.setToken)
  if (refreshToken) {
    await saveRefreshToken(refreshToken);
  }

  return { accessToken, refreshToken, expiresAt };
}

