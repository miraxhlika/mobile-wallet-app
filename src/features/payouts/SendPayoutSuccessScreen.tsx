/**
 * Send Payout Success Screen
 * 
 * Final step of the payout flow.
 * Shows confirmation that payout was submitted successfully.
 * 
 * TODO:
 * - Add animation for success state
 * - Add share/receipt options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SendPayoutSuccessScreenProps } from '../../navigation/types';

export function SendPayoutSuccessScreen({
  route,
  navigation,
}: SendPayoutSuccessScreenProps) {
  const { payoutId, amount, currency } = route.params;

  const handleDone = () => {
    // Navigate back to home, resetting the stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleViewTransaction = () => {
    navigation.replace('TransactionDetails', { transactionId: payoutId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✓</Text>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Payout Sent!</Text>
        <Text style={styles.subtitle}>
          Your payout of {amount} {currency} has been submitted successfully.
        </Text>

        {/* Transaction ID */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Transaction ID</Text>
          <Text style={styles.idValue}>{payoutId}</Text>
        </View>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            The recipient will receive the funds within 1-3 business days.
            You'll receive a notification when the payout is completed.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={handleViewTransaction}
        >
          <Text style={styles.viewButtonText}>View Transaction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  idCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  idLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  idValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  viewButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

