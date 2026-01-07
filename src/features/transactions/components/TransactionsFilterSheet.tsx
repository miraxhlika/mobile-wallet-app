/**
 * `TransactionsFilterSheet`
 *
 * Full-screen filter modal (visuals match Figma screenshot).
 *
 * IMPORTANT: This component is intentionally UI-forward; it keeps the filter state
 * as a plain object and lets the caller map it into API params.
 */
import React, { memo, useCallback, useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { TransactionStatus } from "../../../types";
import { AppText, Button } from "../../../components";

export interface TransactionsFilterState {
  /** Inclusive date range in ISO strings (UTC). */
  dateFrom?: string;
  dateTo?: string;
  /** Multi-select status. */
  statuses: TransactionStatus[];
  /** Multi-select transaction category. Empty = all. */
  categories: Array<"in" | "out" | "fees">;
  /** Multi-select currency. Empty = all. */
  currencies: Array<"USD" | "EUR" | "GBP">;
}

export interface TransactionsFilterSheetProps {
  visible: boolean;
  value: TransactionsFilterState;
  onClose: () => void;
  onApply: (value: TransactionsFilterState) => void;
  onClear: () => void;
}

const STATUS_ITEMS: Array<{ label: string; value: TransactionStatus }> = [
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Declined", value: "failed" },
];

const CATEGORY_ITEMS: Array<{ label: string; value: "in" | "out" | "fees" }> = [
  { label: "In", value: "in" },
  { label: "Out", value: "out" },
  { label: "Fees", value: "fees" },
];

const CURRENCY_ITEMS: Array<{ label: string; value: "USD" | "EUR" | "GBP" }> = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatDMY(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function startOfDayIso(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function endOfDayIso(d: Date): string {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function TransactionsFilterSheetImpl({
  visible,
  value,
  onClose,
  onApply,
  onClear,
}: TransactionsFilterSheetProps) {
  const [draft, setDraft] = useState<TransactionsFilterState>(value);
  const [activePicker, setActivePicker] = useState<"from" | "to" | null>(null);
  const [iosPickerOpen, setIosPickerOpen] = useState(false);

  // Keep draft in sync when opening
  React.useEffect(() => {
    if (visible) {
      setDraft(value);
      setActivePicker(null);
      setIosPickerOpen(false);
    }
  }, [value, visible]);

  const canApply = useMemo(
    () =>
      Boolean(draft.dateFrom) ||
      Boolean(draft.dateTo) ||
      (draft.statuses?.length ?? 0) > 0 ||
      (draft.categories?.length ?? 0) > 0 ||
      (draft.currencies?.length ?? 0) > 0,
    [draft]
  );

  const dateRangeLabel = useMemo(() => {
    if (!draft.dateFrom && !draft.dateTo) return "Select";
    const from = draft.dateFrom ? formatDMY(new Date(draft.dateFrom)) : "?";
    const to = draft.dateTo ? formatDMY(new Date(draft.dateTo)) : "?";
    return `${from} - ${to}`;
  }, [draft.dateFrom, draft.dateTo]);

  const handleApply = useCallback(() => {
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  const handleClear = useCallback(() => {
    onClear();
    onClose();
  }, [onClear, onClose]);

  const openPicker = useCallback((which: "from" | "to") => {
    setActivePicker(which);
    if (Platform.OS === "ios") setIosPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setActivePicker(null);
    setIosPickerOpen(false);
  }, []);

  const handleSetDate = useCallback((which: "from" | "to", date: Date) => {
    setDraft((p) => {
      const next = { ...p };
      if (which === "from") next.dateFrom = startOfDayIso(date);
      else next.dateTo = endOfDayIso(date);

      // Keep range sane: if from > to, nudge the other side.
      if (next.dateFrom && next.dateTo) {
        const fromT = new Date(next.dateFrom).getTime();
        const toT = new Date(next.dateTo).getTime();
        if (fromT > toT) {
          if (which === "from") next.dateTo = endOfDayIso(date);
          else next.dateFrom = startOfDayIso(date);
        }
      }
      return next;
    });
  }, []);

  const handleClearDates = useCallback(() => {
    setDraft((p) => ({ ...p, dateFrom: undefined, dateTo: undefined }));
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent={Platform.OS === "android"}
      navigationBarTranslucent={Platform.OS === "android"}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#222222" }}
        edges={["top", "bottom"]}
      >
        <View style={{ flex: 1 }} className="bg-bg">
          <View className="px-5 pt-3 pb-2 flex-row items-center justify-between z-10">
            <AppText variant="title">Filter</AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="p-2"
              hitSlop={12}
            >
              <AppText variant="title">✕</AppText>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20, // px-5
              paddingTop: 16, // pt-4
              paddingBottom: 40, // pb-10
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Date range */}
            <View className="flex-row items-center justify-between mb-3">
              <AppText variant="label" className="text-text-secondary">
                Date range
              </AppText>
              {draft.dateFrom || draft.dateTo ? (
                <Pressable
                  onPress={handleClearDates}
                  accessibilityRole="button"
                  accessibilityLabel="Clear date range"
                  className="px-3 py-2"
                >
                  <AppText variant="label" className="text-text-secondary">
                    Clear
                  </AppText>
                </Pressable>
              ) : null}
            </View>
            <Pressable
              onPress={() => openPicker("from")}
              accessibilityRole="button"
              accessibilityLabel="Select date range"
              className="rounded-pill border border-border bg-surface-elevated px-4 py-4 flex-row items-center justify-between"
            >
              <AppText variant="body">{dateRangeLabel}</AppText>
              <AppText variant="label" className="text-text-secondary">
                📅
              </AppText>
            </Pressable>

            {/* Date picker UX:
               - Android: DateTimePicker shows a native dialog immediately when mounted.
               - iOS: We wrap it in a small bottom modal with Done for a clear close affordance. */}
            {activePicker && Platform.OS !== "ios" ? (
              <DateTimePicker
                value={
                  activePicker === "from"
                    ? draft.dateFrom
                      ? new Date(draft.dateFrom)
                      : new Date()
                    : draft.dateTo
                    ? new Date(draft.dateTo)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(_, date) => {
                  if (!date) {
                    closePicker();
                    return;
                  }
                  handleSetDate(activePicker, date);
                  // Smooth flow: after picking start, auto-open end.
                  if (activePicker === "from") openPicker("to");
                  else closePicker();
                }}
              />
            ) : null}

            {Platform.OS === "ios" && iosPickerOpen && activePicker ? (
              <Modal
                transparent
                animationType="fade"
                onRequestClose={closePicker}
              >
                <View className="flex-1 justify-end bg-black/60">
                  <Pressable
                    className="flex-1"
                    onPress={closePicker}
                    accessibilityRole="button"
                    accessibilityLabel="Close date picker"
                  />
                  <View className="bg-surface rounded-t-3xl px-5 pt-4 pb-8">
                    <View className="flex-row items-center justify-between">
                      <AppText variant="label" className="text-text-secondary">
                        {activePicker === "from" ? "From" : "To"}
                      </AppText>
                      <Pressable
                        onPress={() => {
                          // If user didn't change anything, just close.
                          closePicker();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Done"
                        className="px-3 py-2"
                      >
                        <AppText variant="label">Done</AppText>
                      </Pressable>
                    </View>
                    <DateTimePicker
                      value={
                        activePicker === "from"
                          ? draft.dateFrom
                            ? new Date(draft.dateFrom)
                            : new Date()
                          : draft.dateTo
                          ? new Date(draft.dateTo)
                          : new Date()
                      }
                      mode="date"
                      display="spinner"
                      onChange={(_, date) => {
                        if (!date) return;
                        handleSetDate(activePicker, date);
                      }}
                    />
                    <View className="mt-4">
                      <Button
                        label={activePicker === "from" ? "Next" : "Done"}
                        onPress={() => {
                          if (activePicker === "from") openPicker("to");
                          else closePicker();
                        }}
                        fullWidth
                      />
                    </View>
                  </View>
                </View>
              </Modal>
            ) : null}

            <View className="my-6 h-px bg-border" />

            {/* Status */}
            <AppText variant="label" className="mb-3 text-text-secondary">
              Status
            </AppText>
            <View className="rounded-2xl bg-surface-elevated overflow-hidden">
              {STATUS_ITEMS.map((s) => {
                const checked = draft.statuses.includes(s.value);
                return (
                  <Pressable
                    key={s.value}
                    onPress={() =>
                      setDraft((p) => ({
                        ...p,
                        statuses: toggleInList(p.statuses, s.value),
                      }))
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={s.label}
                    className={[
                      "px-5 py-4 flex-row items-center justify-between",
                      checked ? "bg-white/10" : "",
                    ].join(" ")}
                  >
                    <AppText variant="body">{s.label}</AppText>
                    <View
                      className={[
                        "h-6 w-6 rounded-md border border-border items-center justify-center",
                        checked ? "bg-[#ED5951] border-[#ED5951]" : "",
                      ].join(" ")}
                    >
                      {checked ? (
                        <AppText variant="caption" className="text-white">
                          ✓
                        </AppText>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="my-6 h-px bg-border" />

            {/* Transaction category */}
            <AppText variant="label" className="mb-3 text-text-secondary">
              Transaction category
            </AppText>
            <View className="rounded-2xl bg-surface-elevated overflow-hidden">
              {CATEGORY_ITEMS.map((c) => {
                const checked = draft.categories.includes(c.value);
                return (
                  <Pressable
                    key={c.value}
                    onPress={() =>
                      setDraft((p) => ({
                        ...p,
                        categories: toggleInList(p.categories, c.value),
                      }))
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={c.label}
                    className={[
                      "px-5 py-4 flex-row items-center justify-between",
                      checked ? "bg-white/10" : "",
                    ].join(" ")}
                  >
                    <AppText variant="body">{c.label}</AppText>
                    <View
                      className={[
                        "h-6 w-6 rounded-md border border-border items-center justify-center",
                        checked ? "bg-[#ED5951] border-[#ED5951]" : "",
                      ].join(" ")}
                    >
                      {checked ? (
                        <AppText variant="caption" className="text-white">
                          ✓
                        </AppText>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="my-6 h-px bg-border" />

            {/* Currency */}
            <AppText variant="label" className="mb-3 text-text-secondary">
              Currency
            </AppText>
            <View className="rounded-2xl bg-surface-elevated overflow-hidden">
              {CURRENCY_ITEMS.map((c) => {
                const checked = draft.currencies.includes(c.value);
                return (
                  <Pressable
                    key={c.value}
                    onPress={() =>
                      setDraft((p) => ({
                        ...p,
                        currencies: toggleInList(p.currencies, c.value),
                      }))
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={c.label}
                    className={[
                      "px-5 py-4 flex-row items-center justify-between",
                      checked ? "bg-white/10" : "",
                    ].join(" ")}
                  >
                    <AppText variant="body">{c.label}</AppText>
                    <View
                      className={[
                        "h-6 w-6 rounded-md border border-border items-center justify-center",
                        checked ? "bg-[#ED5951] border-[#ED5951]" : "",
                      ].join(" ")}
                    >
                      {checked ? (
                        <AppText variant="caption" className="text-white">
                          ✓
                        </AppText>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-10 gap-3">
              <Button
                label="Apply"
                onPress={handleApply}
                disabled={!canApply}
                fullWidth
              />
              <Button
                label="Clear all"
                onPress={handleClear}
                variant="secondary"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export const TransactionsFilterSheet = memo(TransactionsFilterSheetImpl);
