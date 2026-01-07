/**
 * Auth store using Zustand.
 * 
 * Manages:
 * - Access token state (in-memory, hydrated from secure storage on app start)
 * - Hydration status flag
 * 
 * SECURITY:
 * - Token is stored in memory during app runtime
 * - Persisted securely via expo-secure-store (handled in hydration)
 * - Never logged
 */

import { create } from 'zustand';
import {
  saveAccessToken,
  loadAccessToken,
  clearAllTokens,
} from '../../storage/secureToken';

interface AuthState {
  token: string | null;
  hydrated: boolean;
  
  // Actions
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  hydrated: false,

  setToken: async (token: string) => {
    await saveAccessToken(token);
    set({ token });
  },

  clearToken: async () => {
    await clearAllTokens();
    set({ token: null });
  },

  hydrate: async () => {
    if (get().hydrated) return;
    
    try {
      const token = await loadAccessToken();
      set({ token, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));

