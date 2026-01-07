/**
 * API Client with authorization header injection and error normalization.
 *
 * ASSUMPTIONS:
 * - Base URL is provided via EXPO_PUBLIC_API_BASE_URL env variable
 * - API returns JSON responses
 * - Authorization uses Bearer token scheme
 */

import { ApiError } from "../../types";
import { useAuthStore } from "../../features/auth/store";

// Get base URL from Expo public env variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

/**
 * Normalize various error types into a consistent ApiError shape
 */
function normalizeError(error: unknown, statusCode?: number): ApiError {
  // Network errors (no internet, DNS failure, etc.)
  if (error instanceof TypeError && error.message.includes("Network")) {
    return {
      type: "network",
      message: "Network error. Please check your connection.",
      originalError: error,
    };
  }

  // HTTP errors with status code
  if (statusCode && statusCode >= 400) {
    let message = "An error occurred";

    if (statusCode === 401) message = "Unauthorized. Please log in again.";
    else if (statusCode === 403) message = "Access denied.";
    else if (statusCode === 404) message = "Resource not found.";
    else if (statusCode === 422) message = "Invalid request data.";
    else if (statusCode >= 500)
      message = "Server error. Please try again later.";

    return {
      type: "http",
      message,
      statusCode,
      originalError: error,
    };
  }

  // Unknown errors
  return {
    type: "unknown",
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
    originalError: error,
  };
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Generic fetch wrapper with auth header injection and error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, ...fetchOptions } = options;

  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Inject auth header if token exists and not skipped
  if (!skipAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse response
    let data: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-2xx responses
    if (!response.ok) {
      throw normalizeError(data, response.status);
    }

    return data as T;
  } catch (error) {
    // If already normalized, rethrow
    if ((error as ApiError).type) {
      throw error;
    }

    // Normalize and throw
    throw normalizeError(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience methods
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">
  ) => apiRequest<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">
  ) => apiRequest<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">
  ) => apiRequest<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
