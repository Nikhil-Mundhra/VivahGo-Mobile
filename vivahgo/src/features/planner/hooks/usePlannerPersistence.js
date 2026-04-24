import { useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAccessiblePlanners,
  fetchPlanner,
  plannerAccessQueryKey,
  plannerQueryKey,
  savePlannerMutation,
} from "../api.js";
import { DEFAULT_REMINDER_SETTINGS, normalizePlanner } from "../../../plannerDefaults";
import { normalizePlannerFrameworkProgress } from "../lib/plannerFramework.js";
import { ackMutation, createPlannerMutationJournal, enqueueMutation, failMutation, maybeRollback } from "../lib/plannerMutationManager.js";
import {
  DEMO_PLANNER_STORAGE_KEY,
  TASKS_VIEW_SESSION_KEY,
  VENDORS_VIEW_SESSION_KEY,
  buildPlannerSnapshot,
  buildPlannerTabPath,
  createCorrelationId,
  derivePlanAccess,
  getPlannerTabFromLocation,
  isPlannerTabUrlSyncEnabled,
  shouldShowOnboarding,
} from "../lib/plannerShellState.js";
import {
  buildPlannerTabSyncMessage,
  publishPlannerTabSyncMessage,
  shouldAcceptPlannerTabSyncMessage,
  subscribeToPlannerTabSyncMessages,
} from "../lib/plannerTabSync.js";

export function usePlannerPersistence({ store, queryClient }) {
  const {
    activePlanId,
    authMode,
    authToken,
    currentPlannerRef,
    customTemplates,
    events,
    expenses,
    guests,
    isBootstrapping,
    lastDispatchedPlannerRef,
    lastSyncedPlannerRef,
    marriages,
    onboardingCompleted,
    pendingPlannerSaveRef,
    planAccess,
    plannerMutationJournalRef,
    plannerOwnerId,
    plannerRevision,
    plannerTabIdRef,
    saveTimerRef,
    screen,
    setAccessibleWorkspaces,
    setActivePlanId,
    setCollaborators,
    setCustomTemplates,
    setEvents,
    setExpenses,
    setGuests,
    setMarriages,
    setOnboardingCompleted,
    setPlanAccess,
    setPlannerOwnerId,
    setPlannerRevision,
    setRequiresOnboarding,
    setSaveState,
    setScreen,
    setTab,
    setTasks,
    setVendors,
    setWedding,
    suppressNextPlannerBroadcastRef,
    suppressNextPlannerSaveRef,
    tab,
    tasks,
    user,
    vendors,
    vendorsView,
    tasksView,
    wedding,
  } = store;
  const effectivePlannerOwnerId = plannerOwnerId || user?.id || "";
  const plannerQueryEnabled = (authMode === "google" || authMode === "clerk")
    && Boolean(authToken)
    && Boolean(effectivePlannerOwnerId);

  const applyPlanner = useCallback((nextPlanner, nextAccess) => {
    const planner = normalizePlanner(nextPlanner);
    setMarriages(planner.marriages || []);
    setActivePlanId(planner.activePlanId);
    setOnboardingCompleted(Boolean(planner.onboardingCompleted));
    setCustomTemplates(planner.customTemplates || []);
    setWedding(planner.wedding);
    setEvents(planner.events);
    setExpenses(planner.expenses);
    setGuests(planner.guests);
    setVendors(planner.vendors);
    setTasks(planner.tasks);

    const activePlan = (planner.marriages || []).find((item) => item.id === planner.activePlanId);
    setCollaborators(Array.isArray(activePlan?.collaborators) ? activePlan.collaborators : []);

    if (nextAccess && typeof nextAccess === "object") {
      setPlanAccess({
        role: nextAccess.role || "owner",
        canEdit: Boolean(nextAccess.canEdit ?? true),
        canManageSharing: Boolean(nextAccess.canManageSharing ?? true),
      });
      return;
    }

    setPlanAccess(derivePlanAccess(activePlan, user?.email, "owner"));
  }, [setActivePlanId, setCollaborators, setCustomTemplates, setEvents, setExpenses, setGuests, setMarriages, setOnboardingCompleted, setPlanAccess, setTasks, setVendors, setWedding, user?.email]);

  const syncPlanMetadataFromPlanner = useCallback((nextPlanner) => {
    const normalized = normalizePlanner(nextPlanner);

    setMarriages((current) => {
      let didChange = false;
      const updated = current.map((plan) => {
        const serverPlan = normalized.marriages.find((item) => item.id === plan.id);
        if (!serverPlan) {
          return plan;
        }

        const nextReminderSettings = serverPlan.reminderSettings || { ...DEFAULT_REMINDER_SETTINGS };
        const nextFrameworkProgress = normalizePlannerFrameworkProgress(serverPlan.frameworkProgress);
        const websiteChanged = (serverPlan.websiteSlug || "") !== (plan.websiteSlug || "");
        const reminderChanged = JSON.stringify(plan.reminderSettings || DEFAULT_REMINDER_SETTINGS) !== JSON.stringify(nextReminderSettings);
        const frameworkChanged = JSON.stringify(normalizePlannerFrameworkProgress(plan.frameworkProgress)) !== JSON.stringify(nextFrameworkProgress);

        if (websiteChanged || reminderChanged || frameworkChanged) {
          didChange = true;
          return {
            ...plan,
            websiteSlug: serverPlan.websiteSlug || "",
            reminderSettings: nextReminderSettings,
            frameworkProgress: nextFrameworkProgress,
          };
        }

        return plan;
      });

      return didChange ? updated : current;
    });
  }, [setMarriages]);

  const buildPlannerSnapshotFromState = useCallback(() => (
    buildPlannerSnapshot({
      marriages,
      activePlanId,
      onboardingCompleted,
      customTemplates,
      wedding,
      events,
      expenses,
      guests,
      vendors,
      tasks,
    })
  ), [
    activePlanId,
    customTemplates,
    events,
    expenses,
    guests,
    marriages,
    onboardingCompleted,
    tasks,
    vendors,
    wedding,
  ]);

  const syncPlannerAuthority = useCallback((nextPlanner, nextPlannerRevision, options = {}) => {
    const normalizedPlanner = normalizePlanner(nextPlanner);
    const normalizedRevision = Math.max(0, Number(nextPlannerRevision) || 0);

    lastSyncedPlannerRef.current = normalizedPlanner;
    setPlannerRevision(normalizedRevision);

    if (options.resetJournal) {
      plannerMutationJournalRef.current = createPlannerMutationJournal(normalizedRevision);
      lastDispatchedPlannerRef.current = normalizedPlanner;
      currentPlannerRef.current = normalizedPlanner;
      return normalizedPlanner;
    }

    plannerMutationJournalRef.current.latestAcknowledgedRevision = Math.max(
      plannerMutationJournalRef.current.latestAcknowledgedRevision,
      normalizedRevision
    );

    if (!plannerMutationJournalRef.current.pendingMutations.size) {
      lastDispatchedPlannerRef.current = normalizedPlanner;
    }

    return normalizedPlanner;
  }, [currentPlannerRef, lastDispatchedPlannerRef, lastSyncedPlannerRef, plannerMutationJournalRef, setPlannerRevision]);

  const hydratePlannerFromResponse = useCallback((response, options = {}) => {
    const normalizedPlanner = syncPlannerAuthority(
      response?.planner,
      response?.plannerRevision,
      { resetJournal: options.resetJournal !== false }
    );

    suppressNextPlannerSaveRef.current = true;
    applyPlanner(normalizedPlanner, response?.access);
    setRequiresOnboarding(shouldShowOnboarding(normalizedPlanner));
    setPlannerOwnerId(response?.plannerOwnerId || options.fallbackPlannerOwnerId || "");
    if (options.nextScreen) {
      setScreen(options.nextScreen);
    }

    return normalizedPlanner;
  }, [applyPlanner, setPlannerOwnerId, setRequiresOnboarding, setScreen, suppressNextPlannerSaveRef, syncPlannerAuthority]);

  const hydratePlannerFromTabSync = useCallback((message) => {
    if (!shouldAcceptPlannerTabSyncMessage(message, {
      tabId: plannerTabIdRef.current,
      authMode,
      plannerOwnerId: effectivePlannerOwnerId,
    })) {
      return;
    }

    if (pendingPlannerSaveRef.current || plannerMutationJournalRef.current.pendingMutations.size > 0) {
      return;
    }

    suppressNextPlannerBroadcastRef.current = true;
    suppressNextPlannerSaveRef.current = true;
    const normalizedPlanner = syncPlannerAuthority(
      message.planner,
      message.plannerRevision,
      { resetJournal: false }
    );
    applyPlanner(normalizedPlanner);
    setRequiresOnboarding(shouldShowOnboarding(normalizedPlanner));
    queryClient.setQueryData(plannerQueryKey(effectivePlannerOwnerId), (current) => ({
      ...(current || {}),
      planner: normalizedPlanner,
      plannerRevision: Math.max(0, Number(message.plannerRevision) || 0),
      plannerOwnerId: message.plannerOwnerId || effectivePlannerOwnerId,
    }));
  }, [applyPlanner, authMode, effectivePlannerOwnerId, pendingPlannerSaveRef, plannerMutationJournalRef, plannerTabIdRef, queryClient, setRequiresOnboarding, suppressNextPlannerBroadcastRef, suppressNextPlannerSaveRef, syncPlannerAuthority]);

  const plannerQuery = useQuery({
    queryKey: plannerQueryKey(effectivePlannerOwnerId),
    queryFn: () => fetchPlanner(authToken, effectivePlannerOwnerId),
    enabled: plannerQueryEnabled,
  });

  const accessQuery = useQuery({
    queryKey: plannerAccessQueryKey(),
    queryFn: () => fetchAccessiblePlanners(authToken),
    enabled: (authMode === "google" || authMode === "clerk") && Boolean(authToken),
  });

  const plannerSaveMutation = useMutation({
    mutationFn: async ({ plannerSnapshot, nextPlannerOwnerId }) => {
      const mutation = enqueueMutation(plannerMutationJournalRef.current, {
        correlationId: createCorrelationId(),
        baseRevision: plannerMutationJournalRef.current.latestAcknowledgedRevision,
        nextPlanner: plannerSnapshot,
        previousPlanner: lastDispatchedPlannerRef.current,
      });

      lastDispatchedPlannerRef.current = normalizePlanner(plannerSnapshot);

      try {
        const response = await savePlannerMutation(authToken, plannerSnapshot, nextPlannerOwnerId, mutation);
        return { response, mutation };
      } catch (error) {
        error.plannerMutation = mutation;
        throw error;
      }
    },
    onSuccess: async ({ response, mutation }) => {
      ackMutation(plannerMutationJournalRef.current, {
        correlationId: mutation.correlationId,
        plannerRevision: response?.plannerRevision,
      });

      const normalizedPlanner = syncPlannerAuthority(response?.planner, response?.plannerRevision);
      queryClient.setQueryData(plannerQueryKey(response?.plannerOwnerId || effectivePlannerOwnerId), {
        ...response,
        planner: normalizedPlanner,
      });

      if (mutation.clientSequence === plannerMutationJournalRef.current.latestDispatchedSequence) {
        syncPlanMetadataFromPlanner(normalizedPlanner);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: plannerQueryKey(response?.plannerOwnerId || effectivePlannerOwnerId) }),
        queryClient.invalidateQueries({ queryKey: plannerAccessQueryKey() }),
      ]);

      setSaveState(plannerMutationJournalRef.current.pendingMutations.size === 0 ? "saved" : "saving");
      pendingPlannerSaveRef.current = plannerMutationJournalRef.current.pendingMutations.size > 0;
    },
    onError: async (error, { nextPlannerOwnerId }) => {
      const failedMutation = failMutation(plannerMutationJournalRef.current, {
        correlationId: error?.plannerMutation?.correlationId,
      }) || error?.plannerMutation;

      if (error?.code === "PLANNER_CONFLICT") {
        try {
          const latest = await queryClient.fetchQuery({
            queryKey: plannerQueryKey(nextPlannerOwnerId || effectivePlannerOwnerId),
            queryFn: () => fetchPlanner(authToken, nextPlannerOwnerId || effectivePlannerOwnerId),
          });
          hydratePlannerFromResponse(latest, {
            resetJournal: true,
            fallbackPlannerOwnerId: nextPlannerOwnerId || effectivePlannerOwnerId,
            nextScreen: screen === "app" ? "app" : undefined,
          });
        } catch (conflictError) {
          console.error("Failed to refresh planner after conflict:", conflictError);
        }

        setSaveState(plannerMutationJournalRef.current.pendingMutations.size === 0 ? "error" : "saving");
        pendingPlannerSaveRef.current = plannerMutationJournalRef.current.pendingMutations.size > 0;
        return;
      }

      const rollbackDecision = maybeRollback(plannerMutationJournalRef.current, {
        mutation: failedMutation,
        currentPlanner: currentPlannerRef.current,
      });

      if (rollbackDecision.shouldRollback) {
        const rollbackPlanner = syncPlannerAuthority(
          rollbackDecision.rollbackPlanner,
          plannerMutationJournalRef.current.latestAcknowledgedRevision,
          { resetJournal: false }
        );
        lastDispatchedPlannerRef.current = rollbackPlanner;
        currentPlannerRef.current = rollbackPlanner;
        applyPlanner(rollbackPlanner, planAccess);
      } else {
        try {
          await queryClient.invalidateQueries({ queryKey: plannerQueryKey(nextPlannerOwnerId || effectivePlannerOwnerId) });
        } catch {
          // Best-effort refresh after rollback is non-fatal.
        }
      }

      setSaveState(plannerMutationJournalRef.current.pendingMutations.size === 0 ? "error" : "saving");
      pendingPlannerSaveRef.current = plannerMutationJournalRef.current.pendingMutations.size > 0;
    },
  });

  const runPlannerSaveMutation = useCallback(async (variables) => (
    plannerSaveMutation.mutateAsync(variables)
  ), [plannerSaveMutation]);

  const refreshAccessibleWorkspaces = useCallback(async (token) => {
    if (!token) {
      setAccessibleWorkspaces([]);
      return;
    }

    try {
      const response = await queryClient.fetchQuery({
        queryKey: plannerAccessQueryKey(),
        queryFn: () => fetchAccessiblePlanners(token),
      });
      setAccessibleWorkspaces(Array.isArray(response.planners) ? response.planners : []);
    } catch (error) {
      console.error("Failed to load accessible workspaces:", error);
      setAccessibleWorkspaces([]);
    }
  }, [queryClient, setAccessibleWorkspaces]);

  useEffect(() => {
    currentPlannerRef.current = normalizePlanner(buildPlannerSnapshotFromState());
  }, [buildPlannerSnapshotFromState, currentPlannerRef]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(VENDORS_VIEW_SESSION_KEY, vendorsView);
  }, [vendorsView]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(TASKS_VIEW_SESSION_KEY, tasksView);
  }, [tasksView]);

  useEffect(() => {
    if (!(authMode === "google" || authMode === "clerk") || !authToken) {
      setAccessibleWorkspaces([]);
      return;
    }

    if (accessQuery.data) {
      setAccessibleWorkspaces(Array.isArray(accessQuery.data.planners) ? accessQuery.data.planners : []);
      return;
    }

    if (accessQuery.isError) {
      setAccessibleWorkspaces([]);
    }
  }, [accessQuery.data, accessQuery.isError, authMode, authToken, setAccessibleWorkspaces]);

  useEffect(() => {
    if (!plannerQueryEnabled) {
      return;
    }

    if (!plannerQuery.data?.planner) {
      return;
    }

    if (plannerMutationJournalRef.current.pendingMutations.size > 0) {
      return;
    }

    hydratePlannerFromResponse(plannerQuery.data, {
      resetJournal: false,
      fallbackPlannerOwnerId: effectivePlannerOwnerId,
      nextScreen: screen === "app" ? "app" : undefined,
    });
  }, [effectivePlannerOwnerId, hydratePlannerFromResponse, plannerMutationJournalRef, plannerQuery.data, plannerQueryEnabled, screen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handlePopState = () => {
      setTab(getPlannerTabFromLocation());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setTab]);

  useEffect(() => {
    if (screen !== "app" || !isPlannerTabUrlSyncEnabled()) {
      return;
    }

    const nextPath = buildPlannerTabPath(tab);
    const nextSearchParams = new URLSearchParams(window.location.search);
    nextSearchParams.delete("tab");
    const nextSearch = nextSearchParams.toString();
    const nextUrl = `${nextPath}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash || ""}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash || ""}`;

    if (currentUrl !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }
  }, [screen, tab]);

  useEffect(() => subscribeToPlannerTabSyncMessages(hydratePlannerFromTabSync), [hydratePlannerFromTabSync]);

  useEffect(() => {
    if (isBootstrapping || !authMode || !effectivePlannerOwnerId) {
      return;
    }

    if ((authMode === "google" || authMode === "clerk") && !authToken) {
      return;
    }

    if (suppressNextPlannerBroadcastRef.current) {
      suppressNextPlannerBroadcastRef.current = false;
      return;
    }

    const planner = buildPlannerSnapshotFromState();
    publishPlannerTabSyncMessage(buildPlannerTabSyncMessage({
      tabId: plannerTabIdRef.current,
      authMode,
      plannerOwnerId: effectivePlannerOwnerId,
      activePlanId,
      plannerRevision,
      planner,
    }));
  }, [
    activePlanId,
    authMode,
    authToken,
    buildPlannerSnapshotFromState,
    effectivePlannerOwnerId,
    isBootstrapping,
    plannerRevision,
    plannerTabIdRef,
    suppressNextPlannerBroadcastRef,
  ]);

  useEffect(() => {
    if (!activePlanId) {
      return;
    }

    setMarriages((current) => {
      let didChange = false;
      const updated = current.map((plan) => {
        if (plan.id !== activePlanId) {
          return plan;
        }

        const nextPlan = {
          ...plan,
          bride: wedding.bride || "",
          groom: wedding.groom || "",
          date: wedding.date || "",
          venue: wedding.venue || "",
          guests: wedding.guests || "",
          budget: wedding.budget || "",
        };

        if (
          nextPlan.bride !== plan.bride
          || nextPlan.groom !== plan.groom
          || nextPlan.date !== plan.date
          || nextPlan.venue !== plan.venue
          || nextPlan.guests !== plan.guests
          || nextPlan.budget !== plan.budget
        ) {
          didChange = true;
          return nextPlan;
        }

        return plan;
      });

      return didChange ? updated : current;
    });
  }, [activePlanId, setMarriages, wedding]);

  useEffect(() => {
    if (isBootstrapping || !authToken) {
      return undefined;
    }

    const planner = buildPlannerSnapshotFromState();

    if (suppressNextPlannerSaveRef.current) {
      suppressNextPlannerSaveRef.current = false;
      pendingPlannerSaveRef.current = plannerMutationJournalRef.current.pendingMutations.size > 0;
      return undefined;
    }

    if (authMode === "demo") {
      localStorage.setItem(DEMO_PLANNER_STORAGE_KEY, JSON.stringify(planner));
      return undefined;
    }

    if ((authMode !== "google" && authMode !== "clerk") || !authToken) {
      return undefined;
    }

    if (!planAccess.canEdit) {
      return undefined;
    }

    pendingPlannerSaveRef.current = true;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveState("saving");
        await runPlannerSaveMutation({
          plannerSnapshot: planner,
          nextPlannerOwnerId: plannerOwnerId,
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 500);

    return () => {
      clearTimeout(saveTimerRef.current);
    };
  }, [
    activePlanId,
    authMode,
    authToken,
    buildPlannerSnapshotFromState,
    customTemplates,
    expenses,
    events,
    guests,
    isBootstrapping,
    marriages,
    onboardingCompleted,
    pendingPlannerSaveRef,
    planAccess.canEdit,
    plannerMutationJournalRef,
    plannerOwnerId,
    runPlannerSaveMutation,
    saveTimerRef,
    setSaveState,
    suppressNextPlannerSaveRef,
    tasks,
    vendors,
    wedding,
  ]);

  return {
    applyPlanner,
    hydratePlannerFromResponse,
    refreshAccessibleWorkspaces,
    syncPlannerAuthority,
    effectivePlannerOwnerId,
  };
}
