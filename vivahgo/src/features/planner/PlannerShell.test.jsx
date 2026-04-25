import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBlankPlanner, createDemoPlanner } from "../../plannerDefaults.js";

const readAuthSession = vi.fn(() => null);
const persistAuthSession = vi.fn((session) => session);
const clearAuthStorage = vi.fn();
const subscribeToForegroundMessages = vi.fn(async () => () => {});
const getBrowserNotificationSupport = vi.fn(async () => ({
  supported: false,
  configured: false,
  permission: "default",
}));

vi.mock("../../authStorage.js", () => ({
  readAuthSession,
  persistAuthSession,
  clearAuthStorage,
  revokeClerkSession: vi.fn(),
  revokeGoogleIdTokenConsent: vi.fn(),
}));

vi.mock("../../components/AuthOptionList.jsx", () => ({
  default: () => null,
}));

vi.mock("../../components/NavIcon.jsx", () => ({
  default: () => null,
}));

vi.mock("../../components/Mandala.jsx", () => ({
  default: () => null,
}));

vi.mock("../../components/FeedbackModal.jsx", () => ({
  default: () => null,
}));

vi.mock("../../components/LegalFooter.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/MarriagePlanSelector.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/NewMarriagePlanModal.jsx", () => ({
  default: () => null,
}));

vi.mock("./components/PlanShareModal.jsx", () => ({
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

vi.mock("./components/AccountScreen.jsx", () => ({
  default: () => null,
}));

vi.mock("../../clerkRuntime.js", () => ({
  shouldEnableClerkRuntime: () => false,
}));

vi.mock("../../firebaseMessaging.js", () => ({
  subscribeToForegroundMessages,
  getBrowserNotificationSupport,
  requestBrowserPushToken: vi.fn(),
  removeBrowserPushToken: vi.fn(),
}));

vi.mock("../../siteUrls.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getMarketingUrl: (path) => `https://marketing.example${path}`,
  };
});

describe("PlannerShell demo flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readAuthSession.mockReturnValue(null);
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/planner");
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the demo planner from the splash screen CTA", async () => {
    const user = userEvent.setup();
    const { default: PlannerShell } = await import("./PlannerShell.jsx");
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PlannerShell />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: "Explore Demo Planner" }));

    expect(await screen.findByRole("button", { name: "Open My Planner ✨" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Open My Planner ✨" }));

    await waitFor(() => {
      expect(screen.getByText("Wedding Calendar")).toBeTruthy();
    });
  });

  it("restores completed demo planners directly into the app", async () => {
    readAuthSession.mockReturnValue({
      mode: "demo",
      user: {
        id: "demo-user",
        name: "VivahGo Demo",
        email: "demo@vivahgo.local",
        picture: "",
      },
    });
    window.localStorage.setItem("vivahgo.demoPlanner", JSON.stringify(createDemoPlanner()));

    const { default: PlannerShell } = await import("./PlannerShell.jsx");
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PlannerShell />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Wedding Calendar")).toBeTruthy();
    });
  });

  it("restores incomplete demo planners back to the splash handoff", async () => {
    readAuthSession.mockReturnValue({
      mode: "demo",
      user: {
        id: "demo-user",
        name: "VivahGo Demo",
        email: "demo@vivahgo.local",
        picture: "",
      },
    });
    window.localStorage.setItem("vivahgo.demoPlanner", JSON.stringify(createBlankPlanner()));

    const { default: PlannerShell } = await import("./PlannerShell.jsx");
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PlannerShell />
      </QueryClientProvider>
    );

    expect(await screen.findByRole("button", { name: "Start My Setup ✨" })).toBeTruthy();
  });
});
