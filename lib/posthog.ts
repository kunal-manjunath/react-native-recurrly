import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined
const host = (Constants.expoConfig?.extra?.posthogHost as string) || 'https://us.i.posthog.com'
const isConfigured = Boolean(projectToken && projectToken !== 'phc_your_project_token_here')

if (!isConfigured && __DEV__) {
  console.warn('PostHog: POSTHOG_PROJECT_TOKEN not set — analytics disabled.')
}

export const posthog = new PostHog(projectToken || 'placeholder_key', {
  host,
  disabled: !isConfigured,
  captureAppLifecycleEvents: true,
  debug: __DEV__,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
  requestTimeout: 10000,
  featureFlagsRequestTimeoutMs: 10000,
})
