/**
 * Send Payout Form Screen
 *
 * Step 1 of payout flow:
 * - Amount + currency
 * - Destination: beneficiary dropdown or custom
 * - Optional note
 * - Inline validation (positive amount + balance check if available)
 */

import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SendPayoutFormScreenProps } from "../../navigation/types";
import type { PayoutRequest } from "../../types";
import { AppText, Button, Card, HIT_SLOP_44 } from "../../components";
import { cn } from "../../components/ui/utils";
import { useBalances } from "../wallet/hooks";
import { ChevronLeftIcon } from "../../components/icons";

type Beneficiary = {
  id: string;
  name: string;
  account: string;
  label?: string;
};

type DestinationKind = "beneficiary" | "custom";

const FALLBACK_CURRENCIES = ["EUR", "USD", "GBP"] as const;

const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: "ben_1", name: "Alex Johnson", account: "alex.johnson@example.com", label: "Personal" },
  { id: "ben_2", name: "Native Teams LTD", account: "NTL-REF-102938", label: "Business" },
  { id: "ben_3", name: "Sara Ahmed", account: "sara.ahmed@example.com" },
];

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

function formatAccountHint(account: string): string {
  if (!account) return "";
  if (account.includes("@")) return account;
  if (account.length <= 10) return account;
  return `${account.slice(0, 4)}…${account.slice(-4)}`;
}

export function SendPayoutFormScreen({ navigation }: SendPayoutFormScreenProps) {
  const { balances } = useBalances();

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

  const currencyOptions = useMemo(() => {
    const fromBalances = balances.map((b) => b.currency).filter(Boolean);
    const merged = [...new Set([...fromBalances, ...FALLBACK_CURRENCIES])];
    return merged.length ? merged : [...FALLBACK_CURRENCIES];
  }, [balances]);

  const defaultCurrency = useMemo(() => {
    return currencyOptions.includes("EUR") ? "EUR" : currencyOptions[0] ?? "EUR";
  }, [currencyOptions]);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  const [destinationKind, setDestinationKind] = useState<DestinationKind>("beneficiary");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(MOCK_BENEFICIARIES[0]?.id ?? "");

  const selectedBeneficiary = useMemo(() => {
    return MOCK_BENEFICIARIES.find((b) => b.id === selectedBeneficiaryId) ?? null;
  }, [selectedBeneficiaryId]);

  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [note, setNote] = useState("");

  const [destinationSheetOpen, setDestinationSheetOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const availableBalance = useMemo(() => {
    const b = balances.find((x) => x.currency === currency);
    if (!b?.available) return null;
    const n = Number.parseFloat(b.available);
    if (!Number.isFinite(n)) return null;
    return n;
  }, [balances, currency]);

  const validation = useMemo(() => {
    const amountNum = parsePositiveAmount(amount);

    const errors: Partial<Record<
      "amount" | "currency" | "destination" | "recipientName" | "recipientAccount",
      string
    >> = {};

    if (!amount.trim()) errors.amount = "Amount is required.";
    else if (amountNum === null || amountNum <= 0) errors.amount = "Enter a positive amount.";
    else if (availableBalance !== null && amountNum > availableBalance) {
      errors.amount = `Insufficient balance. Available: ${availableBalance.toFixed(2)} ${currency}.`;
    }

    if (!currency) errors.currency = "Currency is required.";

    if (destinationKind === "beneficiary") {
      if (!selectedBeneficiary) errors.destination = "Select a beneficiary.";
    } else {
      if (!recipientName.trim()) errors.recipientName = "Recipient name is required.";
      if (!recipientAccount.trim()) errors.recipientAccount = "Destination is required.";
    }

    const isValid = Object.keys(errors).length === 0;
    return { errors, isValid };
  }, [amount, availableBalance, currency, destinationKind, recipientAccount, recipientName, selectedBeneficiary]);

  const resolvedRecipient = useMemo(() => {
    if (destinationKind === "beneficiary" && selectedBeneficiary) {
      return { name: selectedBeneficiary.name, account: selectedBeneficiary.account };
    }
    return { name: recipientName.trim(), account: recipientAccount.trim() };
  }, [destinationKind, recipientAccount, recipientName, selectedBeneficiary]);

  const destinationLabel = useMemo(() => {
    if (destinationKind === "beneficiary" && selectedBeneficiary) {
      return `${selectedBeneficiary.name} • ${formatAccountHint(selectedBeneficiary.account)}`;
    }
    return "Custom destination";
  }, [destinationKind, selectedBeneficiary]);

  const handleContinue = useCallback(() => {
    setAttemptedSubmit(true);
    if (!validation.isValid) return;

    const payoutData: PayoutRequest = {
      amount: amount.trim(),
      currency: currency.toUpperCase(),
      recipientName: resolvedRecipient.name,
      recipientAccount: resolvedRecipient.account,
      description: note.trim() || undefined,
    };

    navigation.navigate("SendPayoutReview", { payoutData });
  }, [amount, currency, navigation, note, resolvedRecipient, validation.isValid]);

  const handlePickBeneficiary = useCallback((id: string) => {
    setSelectedBeneficiaryId(id);
    setDestinationKind("beneficiary");
    setDestinationSheetOpen(false);
  }, []);

  const handlePickCustom = useCallback(() => {
    setDestinationKind("custom");
    setDestinationSheetOpen(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222222" }} edges={["bottom"]}>
      <View className="flex-1 bg-bg">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerClassName="px-5 pt-5 pb-8 gap-5">
            <AppText variant="title">Send payout</AppText>

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
                <View className="flex-row bg-surface-elevated border border-border rounded-md overflow-hidden">
                  {currencyOptions.slice(0, 3).map((c) => {
                    const active = c === currency;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCurrency(c)}
                        className={cn("px-3 py-3", active && "bg-primary/20")}
                        accessibilityRole="button"
                        accessibilityLabel={`Select currency ${c}`}
                      >
                        <AppText variant="label" className={cn(active ? "text-primary" : "text-text-secondary")}>
                          {c}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              {availableBalance !== null ? (
                <AppText variant="caption" className="mt-2 text-text-secondary">
                  Available: {availableBalance.toFixed(2)} {currency}
                </AppText>
              ) : null}
              {attemptedSubmit && validation.errors.amount ? (
                <AppText variant="caption" className="mt-2 text-danger">
                  {validation.errors.amount}
                </AppText>
              ) : null}
            </Card>

            {/* Destination */}
            <Card>
              <AppText variant="label" className="mb-2">
                Destination
              </AppText>
              <Pressable
                onPress={() => setDestinationSheetOpen(true)}
                className="bg-surface border border-border rounded-md px-4 py-3"
                accessibilityRole="button"
                accessibilityLabel="Select payout destination"
              >
                <AppText variant="body">{destinationLabel}</AppText>
                <AppText variant="caption" className="mt-1 text-text-secondary">
                  Choose a beneficiary or enter a custom destination
                </AppText>
              </Pressable>
              {attemptedSubmit && validation.errors.destination ? (
                <AppText variant="caption" className="mt-2 text-danger">
                  {validation.errors.destination}
                </AppText>
              ) : null}

              {destinationKind === "custom" ? (
                <View className="mt-4 gap-4">
                  <View>
                    <AppText variant="label" className="mb-2">
                      Recipient name
                    </AppText>
                    <TextInput
                      value={recipientName}
                      onChangeText={setRecipientName}
                      placeholder="John Doe"
                      placeholderTextColor="#9E9FA6"
                      autoCapitalize="words"
                      className="bg-surface border border-border rounded-md px-4 py-3 text-text-primary"
                    />
                    {attemptedSubmit && validation.errors.recipientName ? (
                      <AppText variant="caption" className="mt-2 text-danger">
                        {validation.errors.recipientName}
                      </AppText>
                    ) : null}
                  </View>

                  <View>
                    <AppText variant="label" className="mb-2">
                      Destination (account / email)
                    </AppText>
                    <TextInput
                      value={recipientAccount}
                      onChangeText={setRecipientAccount}
                      placeholder="account@example.com or account ID"
                      placeholderTextColor="#9E9FA6"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="bg-surface border border-border rounded-md px-4 py-3 text-text-primary"
                    />
                    {attemptedSubmit && validation.errors.recipientAccount ? (
                      <AppText variant="caption" className="mt-2 text-danger">
                        {validation.errors.recipientAccount}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </Card>

            {/* Note */}
            <Card>
              <AppText variant="label" className="mb-2">
                Note <AppText variant="caption" className="text-text-secondary">(optional)</AppText>
              </AppText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a message for the recipient"
                placeholderTextColor="#9E9FA6"
                multiline
                numberOfLines={3}
                className="bg-surface border border-border rounded-md px-4 py-3 text-text-primary"
                style={{ minHeight: 96, textAlignVertical: "top" }}
              />
            </Card>
          </ScrollView>

          <View className="px-5 pb-5">
            <Button
              label="Continue to review"
              onPress={handleContinue}
              disabled={!validation.isValid}
              fullWidth
            />
          </View>
        </KeyboardAvoidingView>

        {/* Destination Selector Modal */}
        <Modal
          visible={destinationSheetOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setDestinationSheetOpen(false)}
        >
          <Pressable
            className="flex-1 bg-black/60 justify-end"
            onPress={() => setDestinationSheetOpen(false)}
          >
            <Pressable className="bg-surface rounded-t-lg p-5" onPress={() => {}}>
              <AppText variant="title">Select destination</AppText>

              <View className="mt-4 gap-2">
                {MOCK_BENEFICIARIES.map((b) => {
                  const active = destinationKind === "beneficiary" && b.id === selectedBeneficiaryId;
                  return (
                    <Pressable
                      key={b.id}
                      onPress={() => handlePickBeneficiary(b.id)}
                      className={cn(
                        "border border-border rounded-md px-4 py-3",
                        active ? "bg-primary/20" : "bg-surface-elevated"
                      )}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <AppText variant="label">{b.name}</AppText>
                          <AppText variant="caption" className="mt-1 text-text-secondary">
                            {b.label ? `${b.label} • ` : ""}
                            {formatAccountHint(b.account)}
                          </AppText>
                        </View>
                        {active ? (
                          <AppText variant="label" className="text-primary">
                            ✓
                          </AppText>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}

                <Pressable
                  onPress={handlePickCustom}
                  className={cn(
                    "border border-border rounded-md px-4 py-3",
                    destinationKind === "custom" ? "bg-primary/20" : "bg-surface-elevated"
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <AppText variant="label">Custom destination</AppText>
                      <AppText variant="caption" className="mt-1 text-text-secondary">
                        Enter recipient details manually
                      </AppText>
                    </View>
                    {destinationKind === "custom" ? (
                      <AppText variant="label" className="text-primary">
                        ✓
                      </AppText>
                    ) : null}
                  </View>
                </Pressable>
              </View>

              <View className="mt-5">
                <Button
                  label="Close"
                  variant="secondary"
                  onPress={() => setDestinationSheetOpen(false)}
                  fullWidth
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
