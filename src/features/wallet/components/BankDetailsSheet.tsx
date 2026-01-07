/**
 * `BankDetailsSheet`
 *
 * Modal bottom sheet for displaying bank details with copy and share actions.
 * Uses `CopyRow` for copy-to-clipboard and `useToast` for feedback.
 */
import React, { memo, useCallback } from "react";
import { Modal, Platform, Pressable, Share, View } from "react-native";

import { AppText, Button, CopyRow, cn, useToast } from "../../../components";

export interface BankDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  accountName: string;
  swift: string;
  accountNumber: string;
  className?: string;
}

function BankDetailsSheetImpl({
  visible,
  onClose,
  accountName,
  swift,
  accountNumber,
  className,
}: BankDetailsSheetProps) {
  const { showToast } = useToast();

  const handleCopied = useCallback(
    (_value: string) => {
      showToast("Copied to clipboard", "success");
    },
    [showToast]
  );

  const handleShare = useCallback(async () => {
    await Share.share({
      message: [
        "Bank details",
        `Account name: ${accountName}`,
        `SWIFT: ${swift}`,
        `Account number: ${accountNumber}`,
      ].join("\n"),
    });
  }, [accountName, accountNumber, swift]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      // Helps ensure true overlay behavior on iOS (prevents "page" style presentations)
      presentationStyle="overFullScreen"
      // Android: allow the overlay to extend under the status bar when transparent
      statusBarTranslucent={Platform.OS === "android"}
      onRequestClose={onClose}
    >
      {/* Use explicit `style` for layout-critical positioning inside Modal.
          This avoids any flakiness if className interop fails in the modal root. */}
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close bank details"
        />
        <View
          className={cn(
            "rounded-t-lg bg-surface p-5",
            "border-t border-border",
            className
          )}
        >
          <View className="flex-row items-center justify-between">
            <AppText variant="title">Bank details</AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="rounded-pill bg-surface-elevated px-3 py-2"
            >
              <AppText variant="label">✕</AppText>
            </Pressable>
          </View>

          <View className="mt-6">
            <CopyRow label="Account name" value={accountName} onCopied={handleCopied} />
            <View className="h-px bg-border" />
            <CopyRow label="SWIFT" value={swift} onCopied={handleCopied} />
            <View className="h-px bg-border" />
            <CopyRow
              label="Account number"
              value={accountNumber}
              onCopied={handleCopied}
            />
          </View>

          <View className="mt-6">
            <Button label="Share" onPress={handleShare} fullWidth />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const BankDetailsSheet = memo(BankDetailsSheetImpl);


