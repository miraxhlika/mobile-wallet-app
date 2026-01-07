/**
 * React Query hooks for payout operations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayout } from '../../services/api';
import { BALANCES_QUERY_KEY } from '../wallet/hooks';
import { TRANSACTIONS_QUERY_KEY } from '../transactions/hooks';
import type { PayoutRequest, PayoutResponse, ApiError } from '../../types';

/**
 * Hook to create a new payout.
 * 
 * On success:
 * - Invalidates balances (they will be refetched)
 * - Invalidates transactions (the new payout will appear)
 */
export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation<PayoutResponse, ApiError, PayoutRequest>({
    mutationFn: createPayout,
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: BALANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}

