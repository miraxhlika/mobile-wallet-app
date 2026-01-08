import React, { memo, useLayoutEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { LimitsScreenProps } from "../../navigation/types";
import { AppText, Card, ChevronLeftIcon, cn, HIT_SLOP_44 } from "../../components";

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={cn("gap-3", className)}>
      <AppText variant="label" className="uppercase tracking-widest text-text-secondary">
        {title}
      </AppText>
      <Card className="gap-3">
        {children}
      </Card>
    </View>
  );
}

const Row = memo(function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <AppText variant="body" className="flex-1 text-text-secondary">
        {label}
      </AppText>
      <AppText variant="body" className="text-right font-semibold">
        {value}
      </AppText>
    </View>
  );
});

export function LimitsScreen({ navigation }: LimitsScreenProps) {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("MainTabs", { screen: "Info" });
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

  return (
    <SafeAreaView
      // Keep inset areas consistent with our dark header theme
      style={{ flex: 1, backgroundColor: "#222222" }}
      edges={["bottom"]}
    >
      <View className="flex-1 bg-bg">
        <ScrollView contentContainerClassName="px-5 pt-5 pb-10 gap-8">
          <AppText variant="title">Limits & Fees</AppText>
          <Section title="Fees (placeholder)">
            <Row label="Card purchase" value="Free" />
            <Row label="Add funds" value="0.0%" />
            <Row label="Payout" value="Free" />
            <Row label="FX conversion" value="1.5%" />
          </Section>

          <Section title="Limits (placeholder)">
            <Row label="Single payout max" value="$5,000" />
            <Row label="Daily payout max" value="$10,000" />
            <Row label="Monthly payout max" value="$50,000" />
          </Section>

          <Section title="Support (placeholder)">
            <Row label="Email" value="support@example.com" />
            <Row label="Phone" value="+1 (555) 123-4567" />
            <Row label="Hours" value="24/7" />
          </Section>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


