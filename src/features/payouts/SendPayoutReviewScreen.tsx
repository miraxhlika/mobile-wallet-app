/**
 * Send Payout Review Screen
 *
 * Step 2 of payout flow:
 * - Read-only summary
 * - Submit via POST /payouts
 * - Disable double-submit + show loading + handle success/error
 */

import React, { useCallback, useLayoutEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SendPayoutReviewScreenProps } from "../../navigation/types";
import { AppText, Button, Card, HIT_SLOP_44, useToast } from "../../components";
import { ChevronLeftIcon } from "../../components/icons";
import { useCreatePayout } from "./hooks";

export function SendPayoutReviewScreen({ route, navigation }: SendPayoutReviewScreenProps) {
  const { payoutData } = route.params;
  const { showToast } = useToast();
  const { mutate: createPayout, isPending } = useCreatePayout();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("MainTabs", { screen: "Home" });
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={HIT_SLOP_44}
          className="px-4 py-3"
        >
          <ChevronLeftIcon size={26} color="#EFF0F4" />
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleSubmit = useCallback(() => {
    if (isPending) return;

    createPayout(payoutData, {
      onSuccess: (response) => {
        navigation.replace("SendPayoutSuccess", { payout: response });
      },
      onError: (error) => {
        showToast(error.message || "Failed to send payout", "error");
      },
    });
  }, [createPayout, isPending, navigation, payoutData, showToast]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <View className="flex-1 bg-bg">
        <ScrollView contentContainerClassName="px-5 pt-5 pb-8 gap-5">
          <AppText variant="title">Review payout</AppText>

          <View className="items-center py-2">
            <AppText variant="body" className="text-text-secondary">
              Sending
            </AppText>
            <AppText variant="display" className="mt-2">
              {payoutData.amount} {payoutData.currency}
            </AppText>
          </View>

          <Card>
            <AppText variant="body" className="mb-3 font-semibold">
              Payout details
            </AppText>

            <View className="gap-3">
              <View className="flex-row justify-between gap-4">
                <AppText variant="body" className="text-text-secondary">
                  Recipient
                </AppText>
                <AppText variant="body" className="text-right">
                  {payoutData.recipientName}
                </AppText>
              </View>

              <View className="flex-row justify-between gap-4">
                <AppText variant="body" className="text-text-secondary">
                  Destination
                </AppText>
                <AppText variant="body" className="text-right" numberOfLines={1}>
                  {payoutData.recipientAccount}
                </AppText>
              </View>

              {payoutData.description ? (
                <View className="flex-row justify-between gap-4">
                  <AppText variant="body" className="text-text-secondary">
                    Note
                  </AppText>
                  <AppText variant="body" className="text-right">
                    {payoutData.description}
                  </AppText>
                </View>
              ) : null}
            </View>
          </Card>

          <Card variant="subtle">
            <View className="flex-row justify-between">
              <AppText variant="body" className="text-text-secondary">
                Amount
              </AppText>
              <AppText variant="body">
                {payoutData.amount} {payoutData.currency}
              </AppText>
            </View>
            <View className="mt-2 flex-row justify-between">
              <AppText variant="body" className="text-text-secondary">
                Fee
              </AppText>
              <AppText variant="body">0.00 {payoutData.currency}</AppText>
            </View>
            <View className="mt-3 pt-3 border-t border-border flex-row justify-between">
              <AppText variant="body" className="font-semibold">
                Total
              </AppText>
              <AppText variant="body" className="font-semibold">
                {payoutData.amount} {payoutData.currency}
              </AppText>
            </View>
          </Card>

          <AppText variant="body" className="text-center text-text-secondary">
            By confirming, you authorize this payout from your wallet balance. This action cannot be undone.
          </AppText>
        </ScrollView>

        <View className="px-5 pb-5 flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Back"
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={isPending}
              fullWidth
            />
          </View>
          <View className="flex-[2]">
            <Button
              label="Confirm & send"
              onPress={handleSubmit}
              loading={isPending}
              disabled={isPending}
              fullWidth
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
