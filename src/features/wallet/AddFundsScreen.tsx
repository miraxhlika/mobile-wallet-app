/**
 * Add Funds Screen
 * 
 * UI-only screen (no API call).
 * Displays a form to add funds and shows success toast on submit.
 * 
 * TODO:
 * - Integrate with payment provider when ready
 * - Add currency selector
 * - Add payment method selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AddFundsScreenProps } from '../../navigation/types';
import { useToast } from '../../components';

export function AddFundsScreen({ navigation }: AddFundsScreenProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [currency] = useState('USD');

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    // TODO: Integrate with actual payment flow
    // For now, just show success toast
    showToast(`Successfully added ${amount} ${currency} to your wallet!`, 'success');
    
    // Navigate back after showing success
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const quickAmounts = ['50', '100', '250', '500'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount to Add</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={styles.currencyCode}>{currency}</Text>
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.section}>
            <Text style={styles.label}>Quick Select</Text>
            <View style={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => setAmount(quickAmount)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === quickAmount && styles.quickAmountTextActive,
                    ]}
                  >
                    ${quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method Placeholder */}
          <View style={styles.section}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentMethodCard}>
              <View style={styles.cardIcon}>
                <Text>💳</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>Visa ending in 4242</Text>
                <Text style={styles.cardExpiry}>Expires 12/25</Text>
              </View>
              <Text style={styles.changeText}>Change</Text>
            </View>
            <Text style={styles.disclaimer}>
              This is a demo. No actual payment will be processed.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!amount || parseFloat(amount) <= 0) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Text style={styles.submitButtonText}>
              Add {amount ? `$${amount}` : 'Funds'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#3B82F6',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  quickAmountTextActive: {
    color: '#3B82F6',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  cardExpiry: {
    fontSize: 12,
    color: '#6B7280',
  },
  changeText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

