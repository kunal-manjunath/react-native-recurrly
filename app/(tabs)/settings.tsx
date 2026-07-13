import { useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView as RNSSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const posthog = usePostHog();

  const handleSignOut = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>Settings</Text>

      <TouchableOpacity
        onPress={handleSignOut}
        className="mt-auto mb-4 bg-red-500 rounded-xl py-4 items-center"
      >
        <Text className="text-white font-semibold text-base">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
