/**
 * AsyncStorage helpers for persisting non-sensitive data.
 * 
 * Used for:
 * - Selected currency preference
 * - UI filters
 * - Other user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SELECTED_CURRENCY: 'wallet_selected_currency',
  TRANSACTION_FILTERS: 'wallet_transaction_filters',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Currency Preference
// ─────────────────────────────────────────────────────────────────────────────

export async function saveSelectedCurrency(currency: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_CURRENCY, currency);
  } catch (error) {
    console.error('Failed to save selected currency:', error);
  }
}

export async function loadSelectedCurrency(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.SELECTED_CURRENCY);
  } catch (error) {
    console.error('Failed to load selected currency:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Filters
// ─────────────────────────────────────────────────────────────────────────────

export interface StoredFilters {
  type?: string;
  status?: string;
  currency?: string;
}

export async function saveTransactionFilters(filters: StoredFilters): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.TRANSACTION_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save transaction filters:', error);
  }
}

export async function loadTransactionFilters(): Promise<StoredFilters | null> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.TRANSACTION_FILTERS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load transaction filters:', error);
    return null;
  }
}

export async function clearTransactionFilters(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.TRANSACTION_FILTERS);
  } catch (error) {
    console.error('Failed to clear transaction filters:', error);
  }
}

