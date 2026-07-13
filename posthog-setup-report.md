# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly subscription tracking app (Expo + React Native). The SDK was already installed (`posthog-react-native@^4.55.0`), the client was configured in `lib/posthog.ts` using `expo-constants` to read tokens from `app.config.js` extras, and `PostHogProvider` with manual screen tracking and automatic user identification (via Clerk's `useUser`) was already wired into `app/_layout.tsx`. The wizard set the correct PostHog project token and host in `.env`, then added `posthog.capture()` calls across auth and home screens for all ten planned events.

| Event name | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completed sign-in (password or MFA). | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | User attempted sign-in but received an error. | `app/(auth)/sign-in.tsx` |
| `mfa_code_sent` | MFA email verification code was sent during sign-in. | `app/(auth)/sign-in.tsx` |
| `mfa_verified` | User verified their MFA email code and completed sign-in. | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User submitted sign-up form and email verification was initiated. | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | User attempted sign-up but received an error. | `app/(auth)/sign-up.tsx` |
| `email_verified` | User verified their email and completed account creation. | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User tapped Log Out in Settings. | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User tapped a subscription card to expand its details. | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | User tapped an expanded subscription card to collapse it. | `app/(tabs)/index.tsx` |

## Next steps

We've built a dashboard and five insights so you can monitor user behavior from day one:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/407531/dashboard/1839553)
- [Sign-ups & Sign-ins over time](https://us.posthog.com/project/407531/insights/NxrAlmWz)
- [Signup → Email Verified funnel](https://us.posthog.com/project/407531/insights/nGhIHAP1)
- [Sign-in failures over time](https://us.posthog.com/project/407531/insights/7oV7aRSs)
- [Subscription interactions](https://us.posthog.com/project/407531/insights/VqkYB1jw)
- [User signouts over time](https://us.posthog.com/project/407531/insights/21jGOTW8)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any onboarding scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — the `UserIdentifier` component in `app/_layout.tsx` handles this via Clerk's `useUser`, but verify it fires on app resume for existing sessions.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
