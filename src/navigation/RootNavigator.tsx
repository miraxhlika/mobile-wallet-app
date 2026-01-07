/**
 * Root Stack Navigator
 *
 * Contains:
 * - Main tab navigator
 * - Modal/full-screen routes (TransactionDetails, SendPayout flow, AddFunds)
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import { TabNavigator } from "./TabNavigator";
import { TransactionDetailsScreen } from "../features/transactions/TransactionDetailsScreen";
import { SendPayoutFormScreen } from "../features/payouts/SendPayoutFormScreen";
import { SendPayoutReviewScreen } from "../features/payouts/SendPayoutReviewScreen";
import { SendPayoutSuccessScreen } from "../features/payouts/SendPayoutSuccessScreen";
import { AddFundsScreen } from "../features/wallet/AddFundsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: "#3B82F6",
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: "Transaction Details" }}
      />
      <Stack.Screen
        name="SendPayoutForm"
        component={SendPayoutFormScreen}
        options={{ title: "Send Payout" }}
      />
      <Stack.Screen
        name="SendPayoutReview"
        component={SendPayoutReviewScreen}
        options={{ title: "Review Payout" }}
      />
      <Stack.Screen
        name="SendPayoutSuccess"
        component={SendPayoutSuccessScreen}
        options={{
          title: "Success",
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="AddFunds"
        component={AddFundsScreen}
        options={{ title: "Add Funds" }}
      />
    </Stack.Navigator>
  );
}
