/**
 * Settings store using Zustand.
 * 
 * Manages:
 * - Selected currency preference
 * - UI filters for transactions
 */

import { create } from 'zustand';
import {
  saveSelectedCurrency,
  loadSelectedCurrency,
} from '../../storage/asyncStorage';

interface SettingsState {
  selectedCurrency: string;
  hydrated: boolean;
  
  // Actions
  setSelectedCurrency: (currency: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  selectedCurrency: 'USD', // Default currency
  hydrated: false,

  setSelectedCurrency: async (currency: string) => {
    await saveSelectedCurrency(currency);
    set({ selectedCurrency: currency });
  },

  hydrate: async () => {
    if (get().hydrated) return;
    
    try {
      const currency = await loadSelectedCurrency();
      set({
        selectedCurrency: currency || 'USD',
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));

