import { useSignIn } from "@clerk/expo";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "credentials" | "verify";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const passwordRef = useRef<TextInput>(null);

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = EMAIL_REGEX.test(email);
  const passwordValid = password.length >= 1;
  const emailError =
    submitted && !emailValid ? "Enter a valid email address" : null;
  const passwordError =
    submitted && !passwordValid ? "Password is required" : null;

  const isLoading = fetchStatus === "fetching";
  const canSubmit = !isLoading;

  const finalize = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          return;
        }

        const url = decorateUrl("/(tabs)");
        router.replace(url as any);
      },
    });
  };

  const handleSignIn = async () => {
    setSubmitted(true);
    if (!emailValid || !passwordValid) return;

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await finalize();
    } else if (signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode();
      setStep("verify");
    }
  };

  const handleVerify = async () => {
    if (!code) return;
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await finalize();
    }
  };

  const BrandBlock = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurly</Text>
          <Text className="auth-wordmark-sub">Smart Billing</Text>
        </View>
      </View>
      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );

  if (step === "verify") {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              <BrandBlock
                title="Check your inbox"
                subtitle={`We sent a 6-digit code to ${email}. Enter it below to continue.`}
              />

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors?.fields?.code && "auth-input-error"
                      )}
                      placeholder="000000"
                      placeholderTextColor="rgba(8,17,38,0.35)"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={handleVerify}
                      autoFocus
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    className={clsx(
                      "auth-button",
                      (!code || isLoading) && "auth-button-disabled"
                    )}
                    onPress={handleVerify}
                    disabled={!code || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify &amp; Sign in</Text>
                    )}
                  </Pressable>

                  <View className="auth-divider-row">
                    <View className="auth-divider-line" />
                    <Text className="auth-divider-text">or</Text>
                    <View className="auth-divider-line" />
                  </View>

                  <Pressable
                    className={clsx(
                      "auth-secondary-button",
                      isLoading && "opacity-50"
                    )}
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-link-row">
                <Pressable
                  onPress={() => {
                    setStep("credentials");
                    setCode("");
                  }}
                >
                  <Text className="auth-link">← Back to sign in</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <BrandBlock
              title="Welcome back"
              subtitle="Sign in to continue managing your subscriptions"
            />

            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      (emailError || errors?.fields?.identifier) &&
                        "auth-input-error"
                    )}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(8,17,38,0.35)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                  {(emailError || errors?.fields?.identifier) && (
                    <Text className="auth-error">
                      {emailError ?? errors?.fields?.identifier?.message}
                    </Text>
                  )}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View
                    className={clsx(
                      "flex-row items-center rounded-2xl border bg-background px-4",
                      (passwordError || errors?.fields?.password)
                        ? "border-destructive"
                        : "border-border"
                    )}
                  >
                    <TextInput
                      ref={passwordRef}
                      className="flex-1 py-4 text-base font-sans-medium text-primary"
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(8,17,38,0.35)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      returnKeyType="done"
                      onSubmitEditing={handleSignIn}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={8}
                    >
                      <Text className="pl-2 text-sm font-sans-semibold text-accent">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {(passwordError || errors?.fields?.password) && (
                    <Text className="auth-error">
                      {passwordError ?? errors?.fields?.password?.message}
                    </Text>
                  )}
                </View>

                {/* Submit */}
                <Pressable
                  className={clsx(
                    "auth-button",
                    (!canSubmit || isLoading) && "auth-button-disabled"
                  )}
                  onPress={handleSignIn}
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-link">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
