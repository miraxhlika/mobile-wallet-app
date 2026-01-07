/**
 * Transaction Details Screen
 * 
 * Displays full details for a single transaction.
 * 
 * TODO:
 * - Add receipt download option
 * - Add share functionality
 * - Improve detail card design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TransactionDetailsScreenProps } from '../../navigation/types';
import { useTransactionById } from './hooks';

export function TransactionDetailsScreen({
  route,
  navigation,
}: TransactionDetailsScreenProps) {
  const { transactionId } = route.params;
  const { data: transaction, isLoading, error, refetch } = useTransactionById(transactionId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load transaction</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Transaction not found'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.type === 'credit' || transaction.type === 'refund';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Amount Header */}
        <View style={styles.amountHeader}>
          <Text
            style={[
              styles.amount,
              isCredit ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {isCredit ? '+' : '-'}{transaction.amount}
          </Text>
          <Text style={styles.currency}>{transaction.currency}</Text>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            transaction.status === 'completed' && styles.statusCompleted,
            transaction.status === 'pending' && styles.statusPending,
            transaction.status === 'failed' && styles.statusFailed,
          ]}
        >
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <DetailRow label="Transaction ID" value={transaction.id} />
          <DetailRow label="Type" value={transaction.type} capitalize />
          <DetailRow label="Description" value={transaction.description} />
          <DetailRow
            label="Created"
            value={new Date(transaction.createdAt).toLocaleString()}
          />
          <DetailRow
            label="Updated"
            value={new Date(transaction.updatedAt).toLocaleString()}
          />
        </View>

        {/* Metadata (if present) */}
        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            {Object.entries(transaction.metadata).map(([key, value]) => (
              <DetailRow
                key={key}
                label={key.replace(/_/g, ' ')}
                value={String(value)}
                capitalize
              />
            ))}
          </View>
        )}

        {/* Placeholder for receipt/actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsPlaceholder}>
            TODO: Add download receipt & share actions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  capitalize?: boolean;
}

function DetailRow({ label, value, capitalize }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, capitalize && styles.capitalize]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  amountHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
  },
  amountPositive: {
    color: '#10B981',
  },
  amountNegative: {
    color: '#EF4444',
  },
  currency: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#374151',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  actionsCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionsPlaceholder: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

