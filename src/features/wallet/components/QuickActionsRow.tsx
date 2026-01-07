/**
 * `QuickActionsRow`
 *
 * 3 quick action buttons (Add / Send / Details).
 */
import React, { memo } from "react";
import { View } from "react-native";

import { IconButton, cn } from "../../../components";
import { AddIcon, SendIcon, BankIcon } from "../../../components/icons";

export interface QuickActionsRowProps {
  onAdd: () => void;
  onSend: () => void;
  onDetails: () => void;
  className?: string;
}

function QuickActionsRowImpl({
  onAdd,
  onSend,
  onDetails,
  className,
}: QuickActionsRowProps) {
  return (
    <View className={cn("flex-row justify-center gap-6", className)}>
      <IconButton
        icon={<AddIcon size={20} color="#fff" />}
        label="Add"
        onPress={onAdd}
        accessibilityLabel="Add funds"
      />
      <IconButton
        icon={<SendIcon size={20} color="#fff" />}
        label="Send"
        onPress={onSend}
        accessibilityLabel="Send money"
      />
      <IconButton
        icon={<BankIcon size={20} color="#fff" />}
        label="Details"
        onPress={onDetails}
        accessibilityLabel="Bank details"
      />
    </View>
  );
}

export const QuickActionsRow = memo(QuickActionsRowImpl);
