import "@/global.css";
import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import { useEffect, useRef } from "react";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — add it to your .env file."
  );
}

SplashScreen.preventAutoHideAsync();

function ScreenTracker() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return null;
}

function UserIdentifier() {
  const { user } = useUser();
  const previousUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (user?.id && user.id !== previousUserId.current) {
      posthog.identify(user.id, {
        $set: {
          name: user.fullName,
        },
        $set_once: {
          first_seen_at: user.createdAt?.toISOString(),
        },
      });
      previousUserId.current = user.id;
    } else if (!user && previousUserId.current) {
      posthog.reset();
      previousUserId.current = undefined;
    }
  }, [user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ["testID"],
          maxElementsCaptured: 20,
        }}
      >
        <ScreenTracker />
        <UserIdentifier />
        <Stack screenOptions={{ headerShown: false }} />
      </PostHogProvider>
    </ClerkProvider>
  );
}
