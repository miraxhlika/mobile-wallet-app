/**
 * `TransactionDetailsCard`
 *
 * Generic key/value card used in Transaction Details.
 * Supports optional copy actions per row.
 */
import React, { memo } from "react";
import type { TextStyle } from "react-native";
import { Text, View } from "react-native";

import { AppText, Card, CopyRow, cn } from "../../../components";

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
}

function TransactionDetailsCardImpl({
  title,
  rows,
  className,
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
            {r.isCopyable ? (
              <CopyRow
                label={r.label}
                value={r.value}
                onCopied={() => r.onCopy?.()}
              />
            ) : (
              <View className="py-3">
                <AppText variant="caption" className="text-text-secondary">
                  {r.label}
                </AppText>
                <Text
                  className={cn("mt-1 text-body text-text-primary", r.valueClassName)}
                  style={r.valueStyle}
                >
                  {r.value}
                </Text>
              </View>
            )}
            {idx < rows.length - 1 ? <View className="h-px bg-border" /> : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

export const TransactionDetailsCard = memo(TransactionDetailsCardImpl);


