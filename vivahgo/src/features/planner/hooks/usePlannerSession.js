import { useCallback, useEffect } from "react";
import {
  clearAuthStorage,
  persistAuthSession,
  readAuthSession,
  revokeClerkSession,
  revokeGoogleIdTokenConsent,
} from "../../../authStorage";
import { createBlankPlanner, createDemoPlanner } from "../../../plannerDefaults";
import { fetchPlanner, plannerQueryKey } from "../api.js";
import { deleteAccount, loginWithClerk, loginWithGoogle, logoutSession } from "../../auth/api.js";
import { getSubscriptionStatus } from "../../marketing/api.js";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEMO_PLANNER_STORAGE_KEY,
  resolvePlannerScreen,
  shouldShowOnboarding,
} from "../lib/plannerShellState.js";

export function usePlannerSession({
  store,
  queryClient,
  applyPlanner,
  hydratePlannerFromResponse,
  refreshAccessibleWorkspaces,
  syncPlannerAuthority,
  fetchAndApplyNotificationSettings,
}) {
  function persistSession(session) {
    return persistAuthSession(session);
  }

  function clearStoredSession() {
    clearAuthStorage("planner");
  }

  const fetchAndApplySubscription = useCallback(async (token) => {
    if (!token) {
      return;
    }

    try {
      const status = await getSubscriptionStatus(token);
      store.setSubscription({
        tier: status.tier || "starter",
        status: status.status || "active",
        currentPeriodEnd: status.currentPeriodEnd || null,
      });
    } catch {
      // Non-fatal: default to starter if status fetch fails.
    }
  }, [store]);

  function resetPlannerExperience({ nextScreen, clearLoginError = false, resetPlannerAuthority = true } = {}) {
    store.pendingPlannerSaveRef.current = false;
    store.suppressNextPlannerSaveRef.current = false;
    store.suppressNextPlannerBroadcastRef.current = false;
    store.setUser(null);
    store.setAuthMode(null);
    store.setAuthToken("");
    store.setPlannerOwnerId("");
    store.setAccessibleWorkspaces([]);
    store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    applyPlanner(createBlankPlanner());
    if (resetPlannerAuthority) {
      syncPlannerAuthority(createBlankPlanner(), 0, { resetJournal: true });
    }
    store.setRequiresOnboarding(false);
    store.setTab("home");
    store.setSaveState("idle");
    if (clearLoginError) {
      store.setLoginError("");
    }
    if (nextScreen) {
      store.setScreen(nextScreen);
    }
  }

  function handleDemoLogin() {
    const demoUser = {
      id: "demo-user",
      name: "VivahGo Demo",
      email: "demo@vivahgo.local",
      picture: "",
    };
    const demoPlanner = createDemoPlanner();

    store.pendingPlannerSaveRef.current = false;
    store.suppressNextPlannerSaveRef.current = false;
    store.suppressNextPlannerBroadcastRef.current = false;
    store.setAuthMode("demo");
    store.setAuthToken("");
    store.setUser(demoUser);
    applyPlanner(demoPlanner);
    syncPlannerAuthority(demoPlanner, 0, { resetJournal: true });
    store.setPlannerOwnerId(demoUser.id);
    store.setAccessibleWorkspaces([]);
    store.setPlanAccess({ role: "owner", canEdit: true, canManageSharing: true });
    persistSession({ mode: "demo", user: demoUser });
    localStorage.setItem(DEMO_PLANNER_STORAGE_KEY, JSON.stringify(demoPlanner));
    store.setLoginError("");
    store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    store.setRequiresOnboarding(false);
    store.setTab("home");
    store.setScreen(resolvePlannerScreen(demoPlanner));
  }

  async function handleClerkLoginSuccess(clerkUser, clerkBackendToken) {
    try {
      store.setIsLoggingIn(true);
      store.setLoginError("");
      const {
        user: authenticatedUser,
        planner,
        access,
        plannerOwnerId: resolvedOwnerId,
        plannerRevision: nextPlannerRevision,
      } = await loginWithClerk(clerkBackendToken || clerkUser?.id || "", clerkUser || {});
      const loginResponse = {
        planner,
        access,
        plannerRevision: nextPlannerRevision,
        plannerOwnerId: resolvedOwnerId || authenticatedUser.id || "",
      };
      const nextSession = persistSession({
        mode: "clerk",
        user: authenticatedUser,
        plannerOwnerId: loginResponse.plannerOwnerId,
      });
      queryClient.setQueryData(plannerQueryKey(loginResponse.plannerOwnerId), loginResponse);

      store.setAuthMode("clerk");
      store.setAuthToken(nextSession?.token || "");
      store.setUser(authenticatedUser);
      hydratePlannerFromResponse(loginResponse, {
        resetJournal: true,
        fallbackPlannerOwnerId: loginResponse.plannerOwnerId,
      });
      await refreshAccessibleWorkspaces(nextSession?.token);
      await fetchAndApplySubscription(nextSession?.token);
      await fetchAndApplyNotificationSettings(nextSession?.token);
      store.setTab("home");
      store.setSaveState("idle");
      store.setScreen(resolvePlannerScreen(loginResponse.planner));
    } catch (error) {
      console.error("Clerk login failed:", error);
      store.setLoginError(error.message || "Clerk login failed.");
    } finally {
      store.setIsLoggingIn(false);
    }
  }

  async function handleGoogleLoginSuccess(credentialResponse) {
    try {
      store.setIsLoggingIn(true);
      store.setLoginError("");
      const {
        user: authenticatedUser,
        planner,
        access,
        plannerOwnerId: resolvedOwnerId,
        plannerRevision: nextPlannerRevision,
      } = await loginWithGoogle(credentialResponse.credential);
      const loginResponse = {
        planner,
        access,
        plannerRevision: nextPlannerRevision,
        plannerOwnerId: resolvedOwnerId || authenticatedUser.id || "",
      };
      const nextSession = persistSession({
        mode: "google",
        user: authenticatedUser,
        plannerOwnerId: loginResponse.plannerOwnerId,
      });
      queryClient.setQueryData(plannerQueryKey(loginResponse.plannerOwnerId), loginResponse);

      store.setAuthMode("google");
      store.setAuthToken(nextSession?.token || "");
      store.setUser(authenticatedUser);
      hydratePlannerFromResponse(loginResponse, {
        resetJournal: true,
        fallbackPlannerOwnerId: loginResponse.plannerOwnerId,
      });
      await refreshAccessibleWorkspaces(nextSession?.token);
      await fetchAndApplySubscription(nextSession?.token);
      await fetchAndApplyNotificationSettings(nextSession?.token);
      store.setTab("home");
      store.setSaveState("idle");
      store.setScreen(resolvePlannerScreen(loginResponse.planner));
    } catch (error) {
      console.error("Login failed:", error);
      store.setLoginError(error.message || "Google login failed.");
    } finally {
      store.setIsLoggingIn(false);
    }
  }

  function handleLoginError(error) {
    console.error("Login failed:", error);
    store.setLoginError(error?.message || "Google login failed.");
  }

  async function handleLogout() {
    try {
      await logoutSession(store.authToken);
    } catch {
      // Best effort only.
    }

    if (store.authMode === "clerk") {
      await revokeClerkSession();
    }

    clearStoredSession();
    resetPlannerExperience({ nextScreen: "login" });
  }

  async function handleDeleteAccount() {
    await deleteAccount(store.authToken);
    if (store.authMode === "clerk") {
      await revokeClerkSession();
    }
    await revokeGoogleIdTokenConsent(store.user?.email);
    clearStoredSession();
    resetPlannerExperience({ nextScreen: "login" });
  }

  function handleExitDemoToLogin() {
    clearStoredSession();
    resetPlannerExperience({ nextScreen: "login", clearLoginError: true, resetPlannerAuthority: false });
  }

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const session = readAuthSession();

      if (!session) {
        if (!cancelled) {
          store.setIsBootstrapping(false);
        }
        return;
      }

      try {
        if (session.mode === "demo") {
          const savedPlanner = JSON.parse(localStorage.getItem(DEMO_PLANNER_STORAGE_KEY) || "null");
          const resolvedDemoPlanner = savedPlanner || createDemoPlanner();
          const demoRequiresOnboarding = shouldShowOnboarding(resolvedDemoPlanner);
          if (!cancelled) {
            store.setAuthMode("demo");
            store.setUser(session.user || null);
            applyPlanner(resolvedDemoPlanner);
            store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
            store.setRequiresOnboarding(demoRequiresOnboarding);
            store.setScreen(resolvePlannerScreen(resolvedDemoPlanner));
          }
          return;
        }

        if ((session.mode === "google" || session.mode === "clerk") && session.token) {
          const cachedPlanner = await queryClient.fetchQuery({
            queryKey: plannerQueryKey(session.plannerOwnerId || session.user?.id || ""),
            queryFn: () => fetchPlanner(session.token, session.plannerOwnerId || session.user?.id || ""),
          });
          if (!cancelled) {
            store.setAuthMode(session.mode);
            store.setAuthToken(session.token);
            store.setUser(session.user || null);
            hydratePlannerFromResponse(cachedPlanner, {
              resetJournal: true,
              fallbackPlannerOwnerId: session.plannerOwnerId || session.user?.id || "",
            });
            await refreshAccessibleWorkspaces(session.token);
            await fetchAndApplySubscription(session.token);
            await fetchAndApplyNotificationSettings(session.token);
            store.setScreen(resolvePlannerScreen(cachedPlanner?.planner));
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        clearStoredSession();
        if (!cancelled) {
          store.setLoginError("Your previous session could not be restored. Please sign in again.");
        }
      } finally {
        if (!cancelled) {
          store.setIsBootstrapping(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [
    applyPlanner,
    fetchAndApplyNotificationSettings,
    hydratePlannerFromResponse,
    queryClient,
    refreshAccessibleWorkspaces,
    store,
    fetchAndApplySubscription,
  ]);

  return {
    persistSession,
    handleDemoLogin,
    handleClerkLoginSuccess,
    handleGoogleLoginSuccess,
    handleLoginError,
    handleLogout,
    handleDeleteAccount,
    handleExitDemoToLogin,
    fetchAndApplySubscription,
  };
}
