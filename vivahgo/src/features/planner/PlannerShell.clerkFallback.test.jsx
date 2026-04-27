import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const readAuthSession = vi.fn(() => null);
const renderLoginScreen = vi.fn(() => null);
const shouldEnableClerkRuntime = vi.fn(() => true);

vi.mock("../../authStorage.js", () => ({
  readAuthSession,
  persistAuthSession: vi.fn((session) => session),
  clearAuthStorage: vi.fn(),
  revokeClerkSession: vi.fn(),
  revokeGoogleIdTokenConsent: vi.fn(),
}));

vi.mock("./components/LoginScreen.jsx", () => ({
  default: (props) => {
    renderLoginScreen(props);
    return null;
  },
}));

vi.mock("../../components/LegalFooter.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/SplashScreen", () => ({
  default: () => null,
}));

vi.mock("./components/OnboardingScreen", () => ({
  default: () => null,
}));

vi.mock("./components/AccountScreen", () => ({
  default: () => null,
}));

vi.mock("../../components/FeedbackModal", () => ({
  default: () => null,
}));

vi.mock("./components/MarriagePlanSelector", () => ({
  default: () => null,
}));

vi.mock("./components/NewMarriagePlanModal", () => ({
  default: () => null,
}));

vi.mock("./components/PlanShareModal", () => ({
  default: () => null,
}));

vi.mock("./components/modals/PlannerUpgradeModal.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/modals/PlannerConfigurePlanModal.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/modals/WeddingDetailsModal.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/shell/PlannerLoadingScreen.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/shell/PlannerTopBar.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/shell/PlannerContentRouter.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/shell/PlannerBottomNav.jsx", () => ({
  default: () => null,
}));

vi.mock("../../firebaseMessaging.js", () => ({
  subscribeToForegroundMessages: vi.fn(async () => () => {}),
}));

vi.mock("./hooks/usePlannerViewport.js", () => ({
  usePlannerViewport: () => ({
    contentAreaRef: { current: null },
    handlePlannerContentKeyDown: vi.fn(),
  }),
}));

vi.mock("./hooks/usePlannerPersistence.js", () => ({
  usePlannerPersistence: () => ({
    applyPlanner: vi.fn(),
    hydratePlannerFromResponse: vi.fn(),
    refreshAccessibleWorkspaces: vi.fn(),
    syncPlannerAuthority: vi.fn(),
  }),
}));

vi.mock("./hooks/usePlannerNotifications.js", () => ({
  usePlannerNotifications: () => ({
    fetchAndApplyNotificationSettings: vi.fn(),
  }),
}));

vi.mock("./hooks/usePlannerPlanActions.js", () => ({
  usePlannerPlanActions: () => ({
    openFeedbackModal: vi.fn(),
    handleSkipOnboarding: vi.fn(),
    handleOnboardComplete: vi.fn(),
    openWeddingDetailsEditor: vi.fn(),
    openAccountSettings: vi.fn(),
    updateActiveMarriageWebsiteSettings: vi.fn(),
    updateActiveMarriageFrameworkProgress: vi.fn(),
    openEventEditorFromCalendar: vi.fn(),
  }),
}));

vi.mock("../../siteUrls.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getMarketingUrl: (path) => `https://marketing.example${path}`,
  };
});

vi.mock("../../clerkRuntime.js", () => ({
  shouldEnableClerkRuntime,
}));

vi.mock("./hooks/usePlannerStore.js", () => ({
  usePlannerStore: () => ({
    screen: "login",
    setShowDesktopFooter: vi.fn(),
    user: null,
    setAvatarLoadError: vi.fn(),
    avatarLoadError: false,
    isBootstrapping: false,
    saveState: "idle",
    loginError: "",
    isLoggingIn: false,
    requiresOnboarding: false,
    setScreen: vi.fn(),
    marriages: [],
    activePlanId: "",
    planAccess: { canEdit: true },
    wedding: null,
    authMode: "anonymous",
    showMarriagePlanSelector: false,
    showFeedbackModal: false,
    tab: "home",
    activeEvents: [],
    activeExpenses: [],
    activeGuests: [],
    activeVendors: [],
    activeTasks: [],
    setActiveEvents: vi.fn(),
    setActiveExpenses: vi.fn(),
    setActiveGuests: vi.fn(),
    setActiveVendors: vi.fn(),
    setActiveTasks: vi.fn(),
    activeWeddingWebsitePath: "",
    activeMarriage: null,
    subscription: null,
    eventToEditId: "",
    presetVenues: [],
    authToken: "",
    plannerOwnerId: "",
    vendorsView: "directory",
    setVendorsView: vi.fn(),
    tasksView: "list",
    setTasksView: vi.fn(),
    handlePlannerTabChange: vi.fn(),
  }),
}));

vi.mock("./hooks/usePlannerSession.js", () => ({
  usePlannerSession: () => ({
    handleGoogleLoginSuccess: vi.fn(),
    handleClerkLoginSuccess: vi.fn(),
    handleLoginError: vi.fn(),
    handleDemoLogin: vi.fn(),
    persistSession: vi.fn(),
  }),
}));

describe("PlannerShell Clerk fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shouldEnableClerkRuntime.mockReturnValue(true);
    window.history.replaceState({}, "", "/planner");
    window.sessionStorage.clear();
    window.localStorage.clear();
    window.__VIVAHGO_CLERK_UNAVAILABLE__ = true;
  });

  it("keeps planner login usable with google and demo while removing Clerk-only options", async () => {
    const { default: PlannerShell } = await import("./PlannerShell.jsx");
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PlannerShell />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(renderLoginScreen).toHaveBeenCalled();
    });

    const latestLoginScreenProps = renderLoginScreen.mock.calls.at(-1)?.[0];
    expect(latestLoginScreenProps).toEqual(expect.objectContaining({
      onDemoLogin: expect.any(Function),
      authOptions: [
        expect.objectContaining({
          id: "google",
          type: "google",
        }),
      ],
    }));
    expect(latestLoginScreenProps.authOptions.map((option) => option.id)).toEqual(["google"]);

    queryClient.clear();
    queryClient.unmount();
  });
});
