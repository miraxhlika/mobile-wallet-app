import React, { memo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { InfoScreenProps } from "../../navigation/types";
import { AppText, Card, cn } from "../../components";

const SettingsRow = memo(function SettingsRow({
  title,
  description,
  onPress,
  className,
}: {
  title: string;
  description?: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn("flex-row items-center justify-between py-3", className)}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View className="flex-1 pr-4">
        <AppText variant="body">{title}</AppText>
        {description ? (
          <AppText variant="caption" className="mt-1 text-text-secondary">
            {description}
          </AppText>
        ) : null}
      </View>
      <AppText variant="label" className="text-text-secondary">
        ›
      </AppText>
    </Pressable>
  );
});

export function InfoScreen({ navigation }: InfoScreenProps) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#222222" }}
      edges={["bottom"]}
    >
      <View className="flex-1 bg-bg">
        <ScrollView contentContainerClassName="px-5 pt-4 pb-10 gap-8">
          <AppText variant="title">Settings</AppText>

          <View className="gap-3">
            <AppText
              variant="caption"
              className="uppercase tracking-widest text-text-secondary"
            >
              Info
            </AppText>
            <Card className="gap-2">
              <SettingsRow
                title="Limits & Fees"
                description="View payout limits, fees, and support details"
                onPress={() => navigation.navigate("Limits")}
              />
            </Card>
          </View>

          <AppText
            variant="caption"
            className="text-center text-text-secondary"
          >
            Version 1.0.0 (Build 1)
          </AppText>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
