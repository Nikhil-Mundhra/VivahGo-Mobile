import { useState, useRef } from "react";
import { buildWeddingWebsitePath, createBlankPlanner } from "../../../plannerDefaults";
import { createPlannerMutationJournal } from "../lib/plannerMutationManager.js";
import { createPlannerTabId } from "../lib/plannerTabSync.js";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  TASKS_VIEW_SESSION_KEY,
  VENDORS_VIEW_SESSION_KEY,
  applyWeddingToPlan,
  buildPlannerSnapshot,
  getPlannerTabFromLocation,
  mergeActivePlanCollection,
} from "../lib/plannerShellState.js";

function readSessionStorageValue(key, defaultValue, allowedValue) {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const storedValue = window.sessionStorage.getItem(key);
  return storedValue === allowedValue ? allowedValue : defaultValue;
}

function filterPlanItems(items, activePlanId) {
  return (items || []).filter((item) => item?.planId === activePlanId);
}

export function usePlannerStore() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState(getPlannerTabFromLocation);
  const [vendorsView, setVendorsView] = useState(() => (
    readSessionStorageValue(VENDORS_VIEW_SESSION_KEY, "directory", "my-vendors")
  ));
  const [tasksView, setTasksView] = useState(() => (
    readSessionStorageValue(TASKS_VIEW_SESSION_KEY, "checklist", "framework")
  ));
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [authToken, setAuthToken] = useState("");
  const [wedding, setWedding] = useState(createBlankPlanner().wedding);
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [guests, setGuests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [plannerRevision, setPlannerRevision] = useState(0);
  const [showWeddingDetailsEditor, setShowWeddingDetailsEditor] = useState(false);
  const [weddingDetailsForm, setWeddingDetailsForm] = useState({ bride: "", groom: "", date: "", country: "", state: "", city: "", budget: "", guests: "" });
  const [extraLocationDraft, setExtraLocationDraft] = useState({ country: "", state: "", city: "" });
  const [showExtraLocationForm, setShowExtraLocationForm] = useState(false);
  const [eventToEditId, setEventToEditId] = useState(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDesktopFooter, setShowDesktopFooter] = useState(true);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [marriages, setMarriages] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [showMarriagePlanSelector, setShowMarriagePlanSelector] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [configuringPlanId, setConfiguringPlanId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [planAccess, setPlanAccess] = useState({ role: "owner", canEdit: true, canManageSharing: true });
  const [plannerOwnerId, setPlannerOwnerId] = useState("");
  const [accessibleWorkspaces, setAccessibleWorkspaces] = useState([]);
  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const [subscription, setSubscription] = useState({ tier: "starter", status: "active", currentPeriodEnd: null });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptMessage, setUpgradePromptMessage] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const [notificationSupport, setNotificationSupport] = useState({ supported: false, configured: false, permission: "default" });
  const [notificationError, setNotificationError] = useState("");
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const saveTimerRef = useRef(null);
  const plannerTabIdRef = useRef(createPlannerTabId());
  const suppressNextPlannerBroadcastRef = useRef(false);
  const suppressNextPlannerSaveRef = useRef(false);
  const pendingPlannerSaveRef = useRef(false);
  const currentPlannerRef = useRef(createBlankPlanner());
  const lastSyncedPlannerRef = useRef(createBlankPlanner());
  const lastDispatchedPlannerRef = useRef(createBlankPlanner());
  const plannerMutationJournalRef = useRef(createPlannerMutationJournal(0));

  function applyWeddingToActivePlan(nextWedding, nextPlanOverrides = {}) {
    setWedding(nextWedding);
    setMarriages((current) => current.map((plan) => (
      plan.id === activePlanId ? applyWeddingToPlan(plan, nextWedding, nextPlanOverrides) : plan
    )));
  }

  function createPlanScopedSetter(setCollection, planId) {
    return (updater) => {
      if (!planId || !planAccess.canEdit) {
        return;
      }

      setCollection((previous) => {
        const currentPlanItems = filterPlanItems(previous, planId);
        const nextPlanItems = typeof updater === "function" ? updater(currentPlanItems) : updater;
        return mergeActivePlanCollection(previous, nextPlanItems, planId);
      });
    };
  }

  function handlePlannerTabChange(nextTab) {
    if (nextTab === "vendors") {
      if (tab === "vendors") {
        setVendorsView((current) => (current === "directory" ? "my-vendors" : "directory"));
        return;
      }

      setTab("vendors");
      return;
    }

    if (nextTab === "tasks") {
      if (tab === "tasks") {
        setTasksView((current) => (current === "checklist" ? "framework" : "checklist"));
        return;
      }

      setTab("tasks");
      return;
    }

    setTab(nextTab);
  }

  const activeEvents = filterPlanItems(events, activePlanId);
  const activeExpenses = filterPlanItems(expenses, activePlanId);
  const activeGuests = filterPlanItems(guests, activePlanId);
  const activeVendors = filterPlanItems(vendors, activePlanId);
  const activeTasks = filterPlanItems(tasks, activePlanId);
  const activeMarriage = marriages.find((item) => item?.id === activePlanId) || null;
  const activeWeddingWebsitePath = buildWeddingWebsitePath(activeMarriage, wedding);
  const activePlan = marriages.find((item) => item.id === activePlanId) || null;
  const extraVenueOptions = Array.isArray(activePlan?.extraLocations) ? activePlan.extraLocations : [];
  const presetVenues = Array.from(new Set([
    wedding.venue,
    ...extraVenueOptions,
  ].filter(Boolean)));

  const setActiveEvents = createPlanScopedSetter(setEvents, activePlanId);
  const setActiveExpenses = createPlanScopedSetter(setExpenses, activePlanId);
  const setActiveGuests = createPlanScopedSetter(setGuests, activePlanId);
  const setActiveVendors = createPlanScopedSetter(setVendors, activePlanId);
  const setActiveTasks = createPlanScopedSetter(setTasks, activePlanId);

  const plannerSnapshot = buildPlannerSnapshot({
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
  });

  return {
    screen,
    setScreen,
    tab,
    setTab,
    vendorsView,
    setVendorsView,
    tasksView,
    setTasksView,
    user,
    setUser,
    authMode,
    setAuthMode,
    authToken,
    setAuthToken,
    wedding,
    setWedding,
    events,
    setEvents,
    expenses,
    setExpenses,
    guests,
    setGuests,
    vendors,
    setVendors,
    tasks,
    setTasks,
    isBootstrapping,
    setIsBootstrapping,
    isLoggingIn,
    setIsLoggingIn,
    loginError,
    setLoginError,
    saveState,
    setSaveState,
    plannerRevision,
    setPlannerRevision,
    showWeddingDetailsEditor,
    setShowWeddingDetailsEditor,
    weddingDetailsForm,
    setWeddingDetailsForm,
    extraLocationDraft,
    setExtraLocationDraft,
    showExtraLocationForm,
    setShowExtraLocationForm,
    eventToEditId,
    setEventToEditId,
    showAccountSettings,
    setShowAccountSettings,
    showFeedbackModal,
    setShowFeedbackModal,
    showDesktopFooter,
    setShowDesktopFooter,
    avatarLoadError,
    setAvatarLoadError,
    marriages,
    setMarriages,
    activePlanId,
    setActivePlanId,
    showMarriagePlanSelector,
    setShowMarriagePlanSelector,
    showNewPlanModal,
    setShowNewPlanModal,
    configuringPlanId,
    setConfiguringPlanId,
    showShareModal,
    setShowShareModal,
    collaborators,
    setCollaborators,
    planAccess,
    setPlanAccess,
    plannerOwnerId,
    setPlannerOwnerId,
    accessibleWorkspaces,
    setAccessibleWorkspaces,
    isSwitchingWorkspace,
    setIsSwitchingWorkspace,
    customTemplates,
    setCustomTemplates,
    onboardingCompleted,
    setOnboardingCompleted,
    requiresOnboarding,
    setRequiresOnboarding,
    subscription,
    setSubscription,
    showUpgradePrompt,
    setShowUpgradePrompt,
    upgradePromptMessage,
    setUpgradePromptMessage,
    notificationPreferences,
    setNotificationPreferences,
    notificationSupport,
    setNotificationSupport,
    notificationError,
    setNotificationError,
    isUpdatingNotifications,
    setIsUpdatingNotifications,
    saveTimerRef,
    plannerTabIdRef,
    suppressNextPlannerBroadcastRef,
    suppressNextPlannerSaveRef,
    pendingPlannerSaveRef,
    currentPlannerRef,
    lastSyncedPlannerRef,
    lastDispatchedPlannerRef,
    plannerMutationJournalRef,
    activeEvents,
    activeExpenses,
    activeGuests,
    activeVendors,
    activeTasks,
    activeMarriage,
    activeWeddingWebsitePath,
    activePlan,
    extraVenueOptions,
    presetVenues,
    setActiveEvents,
    setActiveExpenses,
    setActiveGuests,
    setActiveVendors,
    setActiveTasks,
    applyWeddingToActivePlan,
    handlePlannerTabChange,
    plannerSnapshot,
  };
}
