/**
 * Navigation types for type-safe navigation.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { PayoutRequest, PayoutResponse } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Tab Navigator
// ─────────────────────────────────────────────────────────────────────────────

export type TabParamList = {
  Home: undefined;
  Cards: undefined;
  Info: undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Root Stack Navigator
// ─────────────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Transactions: undefined;
  TransactionDetails: { transactionId: string };
  SendPayoutForm: undefined;
  SendPayoutReview: { payoutData: PayoutRequest };
  SendPayoutSuccess: { payout: PayoutResponse };
  AddFunds: undefined;
  Limits: undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen Props Types
// ─────────────────────────────────────────────────────────────────────────────

// Tab screen props
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type CardsScreenProps = BottomTabScreenProps<TabParamList, 'Cards'>;

export type TransactionsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Transactions'
>;

export type InfoScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Info">,
  NativeStackScreenProps<RootStackParamList>
>;

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

export type LimitsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Limits"
>;

