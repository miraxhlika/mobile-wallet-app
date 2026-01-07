/**
 * `TransactionsPreviewCard`
 *
 * Shows up to 3 recent transactions, or an EmptyState when none exist.
 */
import React, { memo } from "react";
import { Image, Pressable, View } from "react-native";

import type { Transaction } from "../../../types";
import { AppText, Card, EmptyState, cn } from "../../../components";
import { TransactionRow, formatDateMDY } from "../../transactions/components";

export interface TransactionsPreviewCardProps {
  transactions: Transaction[];
  onPressSeeAll: () => void;
  onPressItem: (id: string) => void;
  className?: string;
}

function TransactionsPreviewCardImpl({
  transactions,
  onPressSeeAll,
  onPressItem,
  className,
}: TransactionsPreviewCardProps) {
  const top = transactions.slice(0, 3);

  return (
    <Card variant="elevated" className={cn("gap-4", className)}>
      {top.length === 0 ? (
        <EmptyState
          icon={
            <Image
              source={require("../../../../assets/icons/money-bag.png")}
              resizeMode="contain"
              style={{ width: 44, height: 44 }}
            />
          }
          title="There’s nothing here yet"
          description="Make your first transaction by adding money to your wallet."
          className="py-14"
        />
      ) : (
        <View className="gap-2">
          {top.map((t, idx) => (
            <View key={t.id}>
              <TransactionRow
                id={t.id}
                title={t.description}
                date={formatDateMDY(new Date(t.createdAt))}
                amount={t.amount}
                currency={t.currency}
                type={t.type}
                status={t.status}
                onPress={onPressItem}
                showStatus={false}
                container="plain"
                className="px-2 py-3"
              />
            </View>
          ))}

          <Pressable
            onPress={onPressSeeAll}
            accessibilityRole="button"
            accessibilityLabel="See all transactions"
            className="pt-2"
          >
            <AppText variant="body" className="text-center text-primary">
              See all
            </AppText>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

export const TransactionsPreviewCard = memo(TransactionsPreviewCardImpl);


