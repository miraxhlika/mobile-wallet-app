/**
 * React Query provider setup.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus in mobile apps
      refetchOnWindowFocus: false,
      // Retry failed requests twice
      retry: 2,
      // Consider data stale after 30 seconds
      staleTime: 30_000,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

