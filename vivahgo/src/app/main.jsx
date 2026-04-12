import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ClerkProvider } from '@clerk/react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from "@sentry/react";
import "../index.css";
import App from "./App.jsx";
import { readAuthSession } from "../authStorage.js";
import { initClarity } from "../shared/clarity.js";
import { initPostHog } from "../shared/posthog.js";
import { queryClient } from "../shared/queryClient.js";
import { initSentry } from "../shared/sentry.js";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const initialSession = readAuthSession();
const appErrorFallback = <div className="app-page-fallback" role="alert">Something went wrong. Please refresh and try again.</div>;

function markClerkUnavailable(error, options = {}) {
  if (typeof window !== "undefined") {
    window.__VIVAHGO_CLERK_UNAVAILABLE__ = true;
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

initSentry({ session: initialSession });
initPostHog({ session: initialSession });
initClarity({ session: initialSession });

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

if (clerkPublishableKey) {
  wrappedApp = (
    <ClerkProviderBoundary fallback={providers}>
      <ClerkProvider publishableKey={clerkPublishableKey}>{wrappedApp}</ClerkProvider>
    </ClerkProviderBoundary>
  );
}

createRoot(document.getElementById("root")).render(wrappedApp);
