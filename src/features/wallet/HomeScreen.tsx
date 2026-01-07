/**
 * Home Screen
 * 
 * Displays:
 * - Wallet balances
 * - Recent activity (transactions)
 * - Quick action buttons (Add Funds, Send Payout)
 * 
 * TODO:
 * - Polish UI design
 * - Add pull-to-refresh
 * - Improve balance card design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeScreenProps } from '../../navigation/types';
import { useBalances } from './hooks';
import { useInfiniteTransactions } from '../transactions';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    data: balances,
    isLoading: balancesLoading,
    error: balancesError,
    refetch: refetchBalances,
  } = useBalances();

  const {
    data: transactionsData,
    isLoading: txLoading,
    refetch: refetchTransactions,
  } = useInfiniteTransactions();

  const recentTransactions = transactionsData?.pages?.[0]?.data?.slice(0, 3) || [];

  const isRefreshing = balancesLoading || txLoading;

  const handleRefresh = () => {
    refetchBalances();
    refetchTransactions();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balances Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Balances</Text>
          
          {balancesLoading && !balances && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading balances...</Text>
            </View>
          )}

          {balancesError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load balances</Text>
              <TouchableOpacity onPress={() => refetchBalances()}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {balances && balances.length > 0 ? (
            balances.map((balance, index) => (
              <View key={index} style={styles.balanceCard}>
                <Text style={styles.balanceCurrency}>{balance.currency}</Text>
                <Text style={styles.balanceAmount}>{balance.available}</Text>
                {balance.pending !== '0' && (
                  <Text style={styles.balancePending}>
                    Pending: {balance.pending}
                  </Text>
                )}
              </View>
            ))
          ) : (
            !balancesLoading &&
            !balancesError && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No balances available</Text>
              </View>
            )
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => navigation.navigate('AddFunds')}
            >
              <Text style={styles.actionButtonText}>+ Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('SendPayoutForm')}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Send Payout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {txLoading && !transactionsData && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}

          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                style={styles.transactionItem}
                onPress={() =>
                  navigation.navigate('TransactionDetails', { transactionId: tx.id })
                }
              >
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.transactionType}>{tx.type}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    tx.type === 'credit' || tx.type === 'refund'
                      ? styles.amountPositive
                      : styles.amountNegative,
                  ]}
                >
                  {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}
                  {tx.amount} {tx.currency}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            !txLoading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recent transactions</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 8,
  },
  retryText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyText: {
    color: '#6B7280',
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  balanceCurrency: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  balancePending: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#EF4444',
  },
});

