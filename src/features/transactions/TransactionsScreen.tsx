/**
 * Transactions Screen (Figma-ish)
 *
 * - Uses memoized `TransactionRow`
 * - Uses SectionList grouping by month
 * - Adds a Filter sheet (status/date stub)
 */

import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { TransactionsScreenProps } from "../../navigation/types";
import type {
  Transaction,
  TransactionFilters,
} from "../../types";
import { AppText, ErrorState, HIT_SLOP_44, Pill } from "../../components";
import { ChevronLeftIcon, FilterIcon } from "../../components/icons";
import { useInfiniteTransactions } from "./hooks";
import {
  TransactionRow,
  TransactionsFilterSheet,
  formatDateMDY,
  groupTransactionsByMonth,
  type TransactionsFilterState,
} from "./components";

function applyClientFilters(
  list: Transaction[],
  filters: TransactionsFilterState
): Transaction[] {
  let out = list;

  if (filters.statuses.length > 0) {
    out = out.filter((t) => filters.statuses.includes(t.status));
  }

  if (filters.categories.length > 0) {
    const allowed = new Set(filters.categories);
    out = out.filter((t) => {
      if (t.type === "credit") return allowed.has("in");
      if (t.type === "payout") return allowed.has("out");
      if (t.type === "debit") return allowed.has("fees");
      return true;
    });
  }

  if (filters.currencies.length > 0) {
    const allowed = new Set(filters.currencies);
    out = out.filter((t) => allowed.has(t.currency as any));
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    out = out.filter((t) => new Date(t.createdAt).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    out = out.filter((t) => new Date(t.createdAt).getTime() <= to);
  }
  return out;
}

export function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [compactTitle, setCompactTitle] = useState(false);
  const [filters, setFilters] = useState<TransactionsFilterState>({
    statuses: [],
    categories: [],
    currencies: [],
  });

  const apiFilters = useMemo<TransactionFilters | undefined>(() => {
    const next: TransactionFilters = {};

    // Category mapping: UI -> mock API types (multi)
    if (filters.categories.length > 0) {
      const types: Array<"top-up" | "withdrawal" | "fee"> = [];
      if (filters.categories.includes("in")) types.push("top-up");
      if (filters.categories.includes("out")) types.push("withdrawal");
      if (filters.categories.includes("fees")) types.push("fee");
      next.types = types;
    }

    // Currency mapping: UI -> wallet_id (multi; mock API does not accept currency directly)
    if (filters.currencies.length > 0) {
      const walletIds: number[] = [];
      if (filters.currencies.includes("USD")) walletIds.push(1);
      if (filters.currencies.includes("EUR")) walletIds.push(2);
      if (filters.currencies.includes("GBP")) walletIds.push(3);
      next.walletIds = walletIds;
    }

    // Date range (any)
    if (filters.dateFrom) next.dateFrom = filters.dateFrom;
    if (filters.dateTo) next.dateTo = filters.dateTo;

    // Status (multi)
    if (filters.statuses.length > 0) {
      next.statuses = filters.statuses.filter(
        (s) => s === "pending" || s === "completed" || s === "failed" || s === "cancelled"
      );
    }

    return Object.keys(next).length ? next : undefined;
  }, [filters]);

  const {
    transactions,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(apiFilters);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: compactTitle ? "Transactions" : "",
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("MainTabs", { screen: "Home" });
          }}
          accessibilityRole="button"
          accessibilityLabel="Back to wallet"
          hitSlop={HIT_SLOP_44}
          className="px-4 py-3"
        >
          <ChevronLeftIcon size={26} color="#EFF0F4" />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => setFilterOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          hitSlop={HIT_SLOP_44}
          className="px-4 py-3"
        >
          <FilterIcon size={26} color="#EFF0F4" />
        </Pressable>
      ),
    });
  }, [compactTitle, navigation]);

  const filtered = useMemo(
    () => applyClientFilters(transactions, filters),
    [filters, transactions]
  );

  const sections = useMemo(
    () => groupTransactionsByMonth(filtered),
    [filtered]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePressItem = useCallback(
    (id: string) => navigation.navigate("TransactionDetails", { transactionId: id }),
    [navigation]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View className="px-5 pb-3 pt-5">
        <AppText variant="caption" className="text-text-secondary">
          {section.title}
        </AppText>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({
      item: t,
    }: {
      item: Transaction;
    }) => {
      return (
        <View className="px-5 py-4">
          <TransactionRow
            id={t.id}
            title={t.description}
            date={formatDateMDY(new Date(t.createdAt))}
            amount={t.amount}
            currency={t.currency}
            type={t.type}
            status={t.status}
            onPress={handlePressItem}
            container="plain"
          />
        </View>
      );
    },
    [handlePressItem]
  );

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#222222" }}
        edges={["bottom"]}
      >
        <View className="flex-1 bg-bg">
          <ErrorState
            title="Failed to load transactions"
            description={error.message}
            action={{ label: "Try again", onPress: () => refetch() }}
          />
          <TransactionsFilterSheet
            visible={filterOpen}
            value={filters}
            onClose={() => setFilterOpen(false)}
            onApply={setFilters}
            onClear={() => setFilters({ statuses: [], categories: [], currencies: [] })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#222222" }}
      edges={["bottom"]}
    >
      <View className="flex-1 bg-bg">
        {isLoading && transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <AppText variant="caption" className="mt-2 text-text-secondary">
              Loading...
            </AppText>
          </View>
        ) : (
          <View className="flex-1">
            <View className="px-5 pb-2 pt-4 gap-3">
              {!compactTitle ? (
                <AppText variant="title">Transactions</AppText>
              ) : null}

              {/* Filter chips */}
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => setFilterOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open filters"
                >
                  <Pill
                    text={`Category: ${
                      filters.categories.length
                        ? filters.categories.join(", ")
                        : "All"
                    }`}
                    tone={filters.categories.length ? "info" : "muted"}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setFilterOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open filters"
                >
                  <Pill
                    text={`Currency: ${
                      filters.currencies.length
                        ? filters.currencies.join(", ")
                        : "All"
                    }`}
                    tone={filters.currencies.length ? "info" : "muted"}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setFilterOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open filters"
                >
                  <Pill
                    text={`Status: ${
                      filters.statuses.length
                        ? filters.statuses
                            .map((s) => (s === "failed" ? "declined" : s))
                            .join(", ")
                        : "All"
                    }`}
                    tone={filters.statuses.length ? "info" : "muted"}
                  />
                </Pressable>
              </View>
            </View>

            <View className="mx-5 mt-3 mb-10 flex-1 rounded-2xl bg-surface-elevated overflow-hidden">
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={false}
                contentContainerClassName="pb-6"
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                onScroll={(e) => {
                  const y = e.nativeEvent.contentOffset.y;
                  const next = y > 24;
                  if (next !== compactTitle) setCompactTitle(next);
                }}
                scrollEventThrottle={16}
                renderSectionHeader={renderSectionHeader}
                renderSectionFooter={({ section }) =>
                  section.title === sections[sections.length - 1]?.title ? null : (
                    <View className="px-5">
                      <View className="my-6 h-px bg-border" />
                    </View>
                  )
                }
                renderItem={renderItem}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <View className="items-center py-6">
                      <ActivityIndicator />
                    </View>
                  ) : null
                }
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching && !isFetchingNextPage}
                    onRefresh={refetch}
                  />
                }
                ListEmptyComponent={
                  <View className="px-5 py-10">
                    <AppText variant="title">No transactions yet</AppText>
                    <AppText variant="body" className="mt-2 text-text-secondary">
                      Your transactions will appear here.
                    </AppText>
                  </View>
                }
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={7}
                removeClippedSubviews
                updateCellsBatchingPeriod={50}
              />
            </View>
          </View>
        )}

        <TransactionsFilterSheet
          visible={filterOpen}
          value={filters}
          onClose={() => setFilterOpen(false)}
          onApply={setFilters}
          onClear={() => setFilters({ statuses: [], categories: [], currencies: [] })}
        />
      </View>
    </SafeAreaView>
  );
}
