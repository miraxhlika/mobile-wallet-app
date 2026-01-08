/**
 * React Query provider setup.
 */

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus in mobile apps
      refetchOnWindowFocus: false,
      // Retry failed requests twice
      retry: 2,
      // Consider data stale after 30 seconds
      staleTime: 30_000,
      // Prefer cached data when offline; still refetch when online.
      networkMode: "offlineFirst",
      // Keep queries around long enough to be useful offline.
      gcTime: 24 * 60 * 60_000, // 24h
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Mutations should not run while offline.
      networkMode: "online",
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "nt_wallet_react_query_cache",
  throttleTime: 1_000,
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60_000, // 24h
        // Read-only offline cache: only persist successful queries; don't persist mutations.
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
          shouldDehydrateMutation: () => false,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

