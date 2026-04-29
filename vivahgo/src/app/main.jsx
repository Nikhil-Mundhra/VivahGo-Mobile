import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ClerkProvider } from '@clerk/react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from "@sentry/react";
import "../index.css";
import "../forums.css";
import App from "./App.jsx";
import {
  installVitePreloadErrorHandler,
  renderPreloadFailureFallback,
} from "./bootRecovery.js";
import { readAuthSession } from "../authStorage.js";
import { getClerkRuntimeDiagnostics, shouldEnableClerkRuntime } from "../clerkRuntime.js";
import { initClarity } from "../shared/clarity.js";
import { capturePostHogEvent, initPostHog } from "../shared/posthog.js";
import { queryClient } from "../shared/queryClient.js";
import { captureException, initSentry } from "../shared/sentry.js";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkRuntimeEnabled = shouldEnableClerkRuntime({ publishableKey: clerkPublishableKey });
const initialSession = readAuthSession();
const appErrorFallback = <div className="app-page-fallback" role="alert">Something went wrong. Please refresh and try again.</div>;
let clerkFailureReported = false;

function getCurrentRoutePath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location?.pathname || "/"}${window.location?.search || ""}`;
}

function markClerkUnavailable(error, options = {}) {
  if (typeof window !== "undefined") {
    window.__VIVAHGO_CLERK_UNAVAILABLE__ = true;
  }
  const diagnostics = getClerkRuntimeDiagnostics({
    publishableKey: clerkPublishableKey,
    clerkUnavailable: true,
    routePath: getCurrentRoutePath(),
    error,
  });
  if (!clerkFailureReported) {
    clerkFailureReported = true;
    capturePostHogEvent("clerk_runtime_unavailable", diagnostics);
    if (error instanceof Error) {
      captureException(error, {
        tags: {
          feature: "clerk",
          clerk_runtime_unavailable: "true",
          clerk_frontend_api_host: diagnostics.frontendApiHost || "unknown",
        },
        extra: diagnostics,
        contexts: {
          clerk: diagnostics,
        },
      });
    }
  }
  if (options.log !== false) {
    console.error("Clerk failed to initialize:", error);
  }
}

class ClerkProviderBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    markClerkUnavailable(error, { log: false });
    return { hasError: true };
  }

  componentDidCatch(error) {
    markClerkUnavailable(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

initPostHog({ session: initialSession });
initSentry({ session: initialSession });
initClarity({ session: initialSession });

installVitePreloadErrorHandler({
  onRecoverableError(details, error) {
    capturePostHogEvent("lazy_asset_preload_recovery_started", {
      asset_url: details.assetUrl,
      asset_path: details.assetPath,
      route: details.routePath,
      href: details.href,
      recovery_state: "reloading",
      first_load_attempted: String(details.firstLoadAttempted),
    });
    if (error instanceof Error) {
      captureException(error, {
        tags: {
          feature: "vite-preload",
          preload_recovery_state: "reloading",
        },
        extra: details,
        contexts: {
          preload: details,
        },
      });
    }
  },
  onFatalError(details, error) {
    capturePostHogEvent("lazy_asset_preload_recovery_failed", {
      asset_url: details.assetUrl,
      asset_path: details.assetPath,
      route: details.routePath,
      href: details.href,
      recovery_state: "fallback",
      first_load_attempted: String(details.firstLoadAttempted),
    });
    if (error instanceof Error) {
      captureException(error, {
        tags: {
          feature: "vite-preload",
          preload_recovery_state: "fallback",
        },
        extra: details,
        contexts: {
          preload: details,
        },
      });
    }
  },
  renderFallback: renderPreloadFailureFallback,
});

if (clerkPublishableKey && !isClerkRuntimeEnabled && typeof window !== "undefined") {
  window.__VIVAHGO_CLERK_UNAVAILABLE__ = true;
}

const app = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Sentry.ErrorBoundary fallback={appErrorFallback}>
        <App />
      </Sentry.ErrorBoundary>
      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
  </StrictMode>
);

const providers = app;
let wrappedApp = providers;

if (clientId) {
  wrappedApp = <GoogleOAuthProvider clientId={clientId}>{wrappedApp}</GoogleOAuthProvider>;
}

if (isClerkRuntimeEnabled) {
  const appWithoutClerk = wrappedApp;
  wrappedApp = (
    <ClerkProviderBoundary fallback={appWithoutClerk}>
      <ClerkProvider publishableKey={clerkPublishableKey}>{appWithoutClerk}</ClerkProvider>
    </ClerkProviderBoundary>
  );
}

createRoot(document.getElementById("root")).render(wrappedApp);
