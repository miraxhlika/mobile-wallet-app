/**
 * Secure token storage using expo-secure-store.
 * 
 * SECURITY:
 * - Tokens are stored in the device's secure enclave (iOS Keychain / Android Keystore)
 * - Never log tokens to console
 * - Clear tokens on logout
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'wallet_access_token';
const REFRESH_TOKEN_KEY = 'wallet_refresh_token';

/**
 * Save access token securely
 */
export async function saveAccessToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save access token securely');
    throw error;
  }
}

/**
 * Load access token from secure storage
 */
export async function loadAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to load access token');
    return null;
  }
}

/**
 * Clear access token from secure storage
 */
export async function clearAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear access token');
  }
}

/**
 * Save refresh token securely
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save refresh token securely');
    throw error;
  }
}

/**
 * Load refresh token from secure storage
 */
export async function loadRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to load refresh token');
    return null;
  }
}

/**
 * Clear refresh token from secure storage
 */
export async function clearRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear refresh token');
  }
}

/**
 * Clear all auth tokens
 */
export async function clearAllTokens(): Promise<void> {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
}

