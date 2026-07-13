import { useSignUp } from "@clerk/expo";
import clsx from "clsx";
import { Href, Link, useRouter } from "expo-router";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = EMAIL_REGEX.test(email);
  const passwordValid = password.length >= 8;
  const emailError =
    submitted && !emailValid ? "Enter a valid email address" : null;
  const passwordError =
    submitted && !passwordValid
      ? "Password must be at least 8 characters"
      : null;

  const isLoading = fetchStatus === "fetching";

  const isVerifyStep =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    signUp.missingFields?.length === 0;

  const finalize = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session.currentTask) {
          return;
        }
        const url = decorateUrl("/(tabs)");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.replace(url as Href);
        }
      },
    });
  };

  const handleSignUp = async () => {
    setSubmitted(true);
    if (!emailValid || !passwordValid) return;

    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    if (!code) return;

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
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

  if (isVerifyStep) {
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
                title="Verify your email"
                subtitle={`We sent a 6-digit code to ${email}. Enter it to activate your account.`}
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
                    <Text className="auth-helper">
                      Check your spam folder if you don't see it.
                    </Text>
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
                      <Text className="auth-button-text">Verify email</Text>
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
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Wrong email?</Text>
                <Pressable
                  onPress={async () => {
                    await signUp.reset?.();
                    setCode("");
                    setSubmitted(false);
                  }}
                >
                  <Text className="auth-link">Start over</Text>
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
              title="Create your account"
              subtitle="Start tracking all your subscriptions in one place"
            />

            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      (emailError || errors?.fields?.emailAddress) &&
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
                  {(emailError || errors?.fields?.emailAddress) && (
                    <Text className="auth-error">
                      {emailError ?? errors?.fields?.emailAddress?.message}
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
                      placeholder="Create a password"
                      placeholderTextColor="rgba(8,17,38,0.35)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
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
                  {!passwordError && !errors?.fields?.password && (
                    <Text className="auth-helper">Minimum 8 characters</Text>
                  )}
                </View>

                {/* Submit */}
                <Pressable
                  className={clsx(
                    "auth-button",
                    isLoading && "auth-button-disabled"
                  )}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                <Text className="text-center text-xs font-sans-medium text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Text className="text-accent">Terms of Service</Text> and{" "}
                  <Text className="text-accent">Privacy Policy</Text>
                </Text>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Required for Clerk bot protection on web */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
