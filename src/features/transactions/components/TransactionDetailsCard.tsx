/**
 * `TransactionDetailsCard`
 *
 * Generic key/value card used in Transaction Details.
 * Supports optional copy actions per row.
 */
import React, { memo } from "react";
import type { TextStyle } from "react-native";
import { Pressable, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { AppText, Card, cn, HIT_SLOP_44 } from "../../../components";

export interface TransactionDetailsRow {
  label: string;
  value: string;
  valueClassName?: string;
  valueStyle?: TextStyle;
  isCopyable?: boolean;
  onCopy?: () => void;
}

export interface TransactionDetailsCardProps {
  title?: string;
  rows: TransactionDetailsRow[];
  className?: string;
  showDividers?: boolean;
}

function TransactionDetailsCardImpl({
  title,
  rows,
  className,
  showDividers = true,
}: TransactionDetailsCardProps) {
  return (
    <Card variant="elevated" className={className}>
      {title ? (
        <AppText variant="label" className="mb-3 text-text-secondary">
          {title}
        </AppText>
      ) : null}

      <View>
        {rows.map((r, idx) => (
          <View key={`${r.label}-${idx}`}>
            <View
              className={cn(
                "py-3 flex-row items-center justify-between gap-4",
                !showDividers && idx === rows.length - 1 ? "pb-0" : undefined
              )}
            >
              <AppText
                variant="body"
                className="text-text-secondary flex-1"
                numberOfLines={1}
              >
                {r.label}
              </AppText>

              <View className="flex-row items-center gap-3">
                <AppText
                  variant="body"
                  className={cn("text-text-primary font-semibold", r.valueClassName)}
                  style={r.valueStyle}
                  numberOfLines={1}
                >
                  {r.value}
                </AppText>

                {r.isCopyable ? (
                  <Pressable
                    onPress={async () => {
                      await Clipboard.setStringAsync(r.value);
                      r.onCopy?.();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Copy ${r.label}`}
                    hitSlop={HIT_SLOP_44}
                    className="rounded-pill bg-surface-elevated px-3 py-2"
                  >
                    <AppText variant="label">⧉</AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {showDividers && idx < rows.length - 1 ? (
              <View className="h-px bg-border" />
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

export const TransactionDetailsCard = memo(TransactionDetailsCardImpl);


