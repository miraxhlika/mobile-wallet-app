/**
 * Add Funds Screen
 *
 * UI-only screen (no API call).
 * Form: amount + method selector (Card/Bank Transfer).
 * On submit: show success toast.
 */

import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import type { AddFundsScreenProps } from "../../navigation/types";
import {
  AppText,
  BankIcon,
  Button,
  Card,
  CardTabIcon,
  ChevronLeftIcon,
  HIT_SLOP_44,
  useToast,
} from "../../components";
import { cn } from "../../components/ui/utils";

type FundingMethod = "card" | "bank_transfer";

function normalizeMoneyInput(raw: string): string {
  // Allow digits and a single decimal separator; keep it simple for mobile.
  const cleaned = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const before = cleaned.slice(0, firstDot + 1);
  const after = cleaned.slice(firstDot + 1).replace(/\./g, "");
  return `${before}${after}`;
}

function parsePositiveAmount(value: string): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function AddFundsScreen({ navigation }: AddFundsScreenProps) {
  const { showToast } = useToast();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<FundingMethod>("card");

  const currency = "EUR";

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

  const amountNumber = useMemo(() => parsePositiveAmount(amount), [amount]);
  const isValid = Boolean(amount.trim()) && amountNumber !== null && amountNumber > 0;

  const handleSubmit = useCallback(() => {
    if (!isValid) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    const methodLabel = method === "card" ? "Card" : "Bank Transfer";
    showToast(`Success! ${amount.trim()} ${currency} via ${methodLabel}`, "success");

    // UI-only: clear form for another entry.
    setAmount("");
  }, [amount, currency, isValid, method, showToast]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <StatusBar style="light" />
      <View className="flex-1 bg-bg">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerClassName="px-5 pt-5 pb-8 gap-5">
            <AppText variant="title">Add funds</AppText>

            {/* Amount */}
            <Card>
              <AppText variant="label" className="mb-2">
                Amount
              </AppText>
              <View className="flex-row items-center gap-3">
                <TextInput
                  value={amount}
                  onChangeText={(v) => setAmount(normalizeMoneyInput(v))}
                  placeholder="0.00"
                  placeholderTextColor="#9E9FA6"
                  keyboardType="decimal-pad"
                  className={cn(
                    "flex-1 bg-surface border border-border rounded-md px-4 py-3",
                    "text-text-primary text-[20px] font-semibold"
                  )}
                />
                <View className="px-3 py-3 rounded-md bg-surface border border-border">
                  <AppText variant="label" className="text-text-secondary">
                    {currency}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" className="mt-2 text-text-secondary">
                UI only — no payment will be processed.
              </AppText>
            </Card>

            {/* Method selector */}
            <Card>
              <AppText variant="label" className="mb-3">
                Method
              </AppText>

              <View className="gap-3">
                <Pressable
                  onPress={() => setMethod("card")}
                  accessibilityRole="button"
                  accessibilityLabel="Select Card"
                  className={cn(
                    "flex-row items-center gap-3 px-4 py-4 rounded-md border",
                    method === "card"
                      ? "bg-surface-elevated border-primary"
                      : "bg-surface border-border"
                  )}
                >
                  <View
                    className={cn(
                      "w-10 h-10 rounded-pill items-center justify-center",
                      method === "card" ? "bg-primary/20" : "bg-surface-elevated"
                    )}
                  >
                    <CardTabIcon size={20} color={method === "card" ? "#FF2C55" : "#9E9FA6"} />
                  </View>
                  <View className="flex-1">
                    <AppText variant="label">Card</AppText>
                    <AppText variant="caption" className="text-text-secondary">
                      Instant top up (demo)
                    </AppText>
                  </View>
                  <View
                    className={cn(
                      "w-5 h-5 rounded-pill border items-center justify-center",
                      method === "card" ? "border-primary" : "border-border"
                    )}
                  >
                    {method === "card" ? <View className="w-3 h-3 rounded-pill bg-primary" /> : null}
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setMethod("bank_transfer")}
                  accessibilityRole="button"
                  accessibilityLabel="Select Bank Transfer"
                  className={cn(
                    "flex-row items-center gap-3 px-4 py-4 rounded-md border",
                    method === "bank_transfer"
                      ? "bg-surface-elevated border-primary"
                      : "bg-surface border-border"
                  )}
                >
                  <View
                    className={cn(
                      "w-10 h-10 rounded-pill items-center justify-center",
                      method === "bank_transfer" ? "bg-primary/20" : "bg-surface-elevated"
                    )}
                  >
                    <BankIcon
                      size={20}
                      color={method === "bank_transfer" ? "#FF2C55" : "#9E9FA6"}
                    />
                  </View>
                  <View className="flex-1">
                    <AppText variant="label">Bank Transfer</AppText>
                    <AppText variant="caption" className="text-text-secondary">
                      1–2 business days (demo)
                    </AppText>
                  </View>
                  <View
                    className={cn(
                      "w-5 h-5 rounded-pill border items-center justify-center",
                      method === "bank_transfer" ? "border-primary" : "border-border"
                    )}
                  >
                    {method === "bank_transfer" ? (
                      <View className="w-3 h-3 rounded-pill bg-primary" />
                    ) : null}
                  </View>
                </Pressable>
              </View>
            </Card>

            {/* CTA */}
            <View className="pt-1">
              <Button
                label={amount.trim() ? `Add ${amount.trim()} ${currency}` : "Add funds"}
                fullWidth
                disabled={!isValid}
                onPress={handleSubmit}
              />
              <AppText variant="caption" className="mt-3 text-text-secondary text-center">
                No backend call required — this is UI-only.
              </AppText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
