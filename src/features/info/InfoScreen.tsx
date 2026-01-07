/**
 * Info & Limits Screen
 * 
 * Static placeholder screen showing account info and limits.
 * 
 * TODO:
 * - Fetch actual limits from API
 * - Add account settings
 * - Add help/support links
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function InfoScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.card}>
            <InfoRow label="Account Type" value="Standard" />
            <InfoRow label="Account Status" value="Active" />
            <InfoRow label="Member Since" value="January 2024" />
            <InfoRow label="Verification Level" value="Level 2" />
          </View>
        </View>

        {/* Transaction Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Limits</Text>
          <View style={styles.card}>
            <LimitRow
              label="Daily Payout Limit"
              current="$0"
              max="$10,000"
              percentage={0}
            />
            <LimitRow
              label="Monthly Payout Limit"
              current="$0"
              max="$50,000"
              percentage={0}
            />
            <LimitRow
              label="Single Transaction Max"
              current="—"
              max="$5,000"
              percentage={0}
            />
          </View>
        </View>

        {/* Fees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fee Schedule</Text>
          <View style={styles.card}>
            <InfoRow label="Payout Fee" value="Free" />
            <InfoRow label="Add Funds Fee" value="Free" />
            <InfoRow label="Currency Conversion" value="1.5%" />
            <InfoRow label="Express Payout" value="$2.00" />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <InfoRow label="Email" value="support@wallet.com" />
            <InfoRow label="Phone" value="+1 (555) 123-4567" />
            <InfoRow label="Hours" value="24/7" />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.linksCard}>
            <Text style={styles.link}>Terms of Service</Text>
            <Text style={styles.link}>Privacy Policy</Text>
            <Text style={styles.link}>Cookie Policy</Text>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface LimitRowProps {
  label: string;
  current: string;
  max: string;
  percentage: number;
}

function LimitRow({ label, current, max, percentage }: LimitRowProps) {
  return (
    <View style={styles.limitRow}>
      <View style={styles.limitHeader}>
        <Text style={styles.limitLabel}>{label}</Text>
        <Text style={styles.limitValues}>
          {current} / {max}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
    </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#374151',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  limitRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitLabel: {
    fontSize: 14,
    color: '#374151',
  },
  limitValues: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  linksCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  link: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 24,
  },
});

