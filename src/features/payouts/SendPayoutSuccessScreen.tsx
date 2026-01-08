/**
 * Send Payout Success Screen
 *
 * Step 3 of payout flow:
 * - Show transaction summary
 * - Allow navigating to TransactionDetails or back to Home
 */

import React, { useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SendPayoutSuccessScreenProps } from "../../navigation/types";
import { AppText, Button, Card, Pill } from "../../components";

export function SendPayoutSuccessScreen({ route, navigation }: SendPayoutSuccessScreenProps) {
  const { payout } = route.params;

  const handleDone = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  }, [navigation]);

  const handleViewTransaction = useCallback(() => {
    navigation.replace("TransactionDetails", { transactionId: payout.id });
  }, [navigation, payout.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <View className="flex-1 bg-bg">
        <View className="flex-1 px-5 pt-8 pb-6 justify-center gap-5">
          <View className="items-center">
            <View className="w-20 h-20 rounded-pill bg-success/20 items-center justify-center">
              <AppText variant="title" className="text-success">
                ✓
              </AppText>
            </View>
            <AppText variant="title" className="mt-4 text-center">
              Payout submitted
            </AppText>
            <AppText variant="body" className="mt-2 text-center text-text-secondary">
              {payout.amount} {payout.currency} to {payout.recipientName}
            </AppText>
            <View className="mt-3">
              <Pill
                text={payout.status.toUpperCase()}
                tone={payout.status === "failed" ? "danger" : payout.status === "completed" ? "success" : "warning"}
              />
            </View>
          </View>

          <Card>
            <AppText variant="label" className="mb-3">
              Transaction summary
            </AppText>

            <View className="gap-3">
              <View className="flex-row justify-between gap-4">
                <AppText variant="caption" className="text-text-secondary">
                  Transaction ID
                </AppText>
                <AppText variant="body" className="text-right">
                  {payout.id}
                </AppText>
              </View>

              <View className="flex-row justify-between gap-4">
                <AppText variant="caption" className="text-text-secondary">
                  Amount
                </AppText>
                <AppText variant="body" className="text-right">
                  {payout.amount} {payout.currency}
                </AppText>
              </View>

              <View className="flex-row justify-between gap-4">
                <AppText variant="caption" className="text-text-secondary">
                  Recipient
                </AppText>
                <AppText variant="body" className="text-right">
                  {payout.recipientName}
                </AppText>
              </View>

              <View className="flex-row justify-between gap-4">
                <AppText variant="caption" className="text-text-secondary">
                  Destination
                </AppText>
                <AppText variant="body" className="text-right" numberOfLines={1}>
                  {payout.recipientAccount}
                </AppText>
              </View>

              {payout.description ? (
                <View className="flex-row justify-between gap-4">
                  <AppText variant="caption" className="text-text-secondary">
                    Note
                  </AppText>
                  <AppText variant="body" className="text-right">
                    {payout.description}
                  </AppText>
                </View>
              ) : null}
            </View>
          </Card>

          <Card variant="subtle">
            <AppText variant="caption" className="text-text-secondary text-center">
              The recipient will typically receive the funds within 1–3 business days.
            </AppText>
          </Card>
        </View>

        <View className="px-5 pb-5 gap-3">
          <Button label="View transaction" variant="secondary" onPress={handleViewTransaction} fullWidth />
          <Button label="Done" onPress={handleDone} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}
