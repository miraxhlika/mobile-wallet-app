/**
 * Navigation types for type-safe navigation.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { PayoutRequest } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Tab Navigator
// ─────────────────────────────────────────────────────────────────────────────

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Info: undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Root Stack Navigator
// ─────────────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  TransactionDetails: { transactionId: string };
  SendPayoutForm: undefined;
  SendPayoutReview: { payoutData: PayoutRequest };
  SendPayoutSuccess: { payoutId: string; amount: string; currency: string };
  AddFunds: undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen Props Types
// ─────────────────────────────────────────────────────────────────────────────

// Tab screen props
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type TransactionsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Transactions'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type InfoScreenProps = BottomTabScreenProps<TabParamList, 'Info'>;

// Stack screen props
export type TransactionDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TransactionDetails'
>;

export type SendPayoutFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SendPayoutForm'
>;

export type SendPayoutReviewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SendPayoutReview'
>;

export type SendPayoutSuccessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SendPayoutSuccess'
>;

export type AddFundsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddFunds'
>;

