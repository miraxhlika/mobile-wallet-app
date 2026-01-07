/**
 * Transactions Screen
 * 
 * Displays a paginated list of transactions with infinite scroll.
 * Caps at 50 total transactions.
 * 
 * TODO:
 * - Add filter options (type, status, currency)
 * - Add search functionality
 * - Improve transaction item design
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TransactionsScreenProps } from '../../navigation/types';
import type { Transaction } from '../../types';
import { useInfiniteTransactions } from './hooks';

export function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions();

  // Flatten pages into single array
  const transactions = data?.pages.flatMap((page) => page.data) || [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          navigation.navigate('TransactionDetails', { transactionId: item.id })
        }
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.typeIndicator,
              item.type === 'credit' || item.type === 'refund'
                ? styles.typeCredit
                : styles.typeDebit,
            ]}
          />
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text
                style={[
                  styles.transactionStatus,
                  item.status === 'completed' && styles.statusCompleted,
                  item.status === 'pending' && styles.statusPending,
                  item.status === 'failed' && styles.statusFailed,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              item.type === 'credit' || item.type === 'refund'
                ? styles.amountPositive
                : styles.amountNegative,
            ]}
          >
            {item.type === 'credit' || item.type === 'refund' ? '+' : '-'}
            {item.amount}
          </Text>
          <Text style={styles.transactionCurrency}>{item.currency}</Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptySubtitle}>
          Your transactions will appear here
        </Text>
      </View>
    );
  }, [isLoading]);

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load transactions</Text>
          <Text style={styles.errorMessage}>
            {error.message || 'An error occurred'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor="#3B82F6"
            />
          }
        />
      )}
      
      {/* Transaction count indicator */}
      {transactions.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            {!hasNextPage && transactions.length >= 50 && ' (max reached)'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  typeCredit: {
    backgroundColor: '#10B981',
  },
  typeDebit: {
    backgroundColor: '#EF4444',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  metaSeparator: {
    marginHorizontal: 6,
    color: '#D1D5DB',
  },
  transactionStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statusCompleted: {
    color: '#10B981',
  },
  statusPending: {
    color: '#F59E0B',
  },
  statusFailed: {
    color: '#EF4444',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#EF4444',
  },
  transactionCurrency: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  countBadge: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

