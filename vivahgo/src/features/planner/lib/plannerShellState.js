import { NAV_ITEMS } from "../../../constants";
import { DEFAULT_WEBSITE_SETTINGS, hasWeddingProfile, normalizePlanner } from "../../../plannerDefaults";
import { LOCAL_PLANNER_ROUTE, isLocalHostname, isPlannerHostname } from "../../../siteUrls.js";

export const DEMO_PLANNER_STORAGE_KEY = "vivahgo.demoPlanner";
export const VENDORS_VIEW_SESSION_KEY = "vivahgo.vendorsView";
export const TASKS_VIEW_SESSION_KEY = "vivahgo.tasksView";
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const YEARS = Array.from({ length: 8 }, (_, index) => 2025 + index);
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  browserPushEnabled: false,
  eventReminders: true,
  paymentReminders: true,
};

const PLANNER_TAB_PATH_BY_ID = {
  home: "dashboard",
  events: "events",
  budget: "budget",
  guests: "guests",
  vendors: "vendors",
  tasks: "tasks",
};

const PLANNER_TAB_ID_BY_PATH = Object.fromEntries(
  Object.entries(PLANNER_TAB_PATH_BY_ID).map(([tabId, path]) => [path, tabId])
);

export function getPlannerTabFromLocation() {
  if (typeof window === "undefined") {
    return "home";
  }

  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  if (requestedTab && NAV_ITEMS.some((item) => item.id === requestedTab)) {
    return requestedTab;
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const plannerPath = isLocalHostname(hostname)
    ? (pathname === LOCAL_PLANNER_ROUTE ? "" : pathname.replace(new RegExp(`^${LOCAL_PLANNER_ROUTE}/`), ""))
    : pathname.replace(/^\/+/, "");
  const normalizedPath = plannerPath || "dashboard";

  return PLANNER_TAB_ID_BY_PATH[normalizedPath] || "home";
}

export function getPlannerTabPath(tabId) {
  return PLANNER_TAB_PATH_BY_ID[tabId] || PLANNER_TAB_PATH_BY_ID.home;
}

export function buildPlannerTabPath(tabId) {
  if (typeof window === "undefined") {
    return `/${getPlannerTabPath(tabId)}`;
  }

  const tabPath = getPlannerTabPath(tabId);
  return isLocalHostname(window.location.hostname)
    ? `${LOCAL_PLANNER_ROUTE}/${tabPath}`
    : `/${tabPath}`;
}

export function isPlannerTabUrlSyncEnabled() {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  return isPlannerHostname(hostname) || (isLocalHostname(hostname) && pathname.startsWith(LOCAL_PLANNER_ROUTE));
}

export function parseDateStr(value) {
  const [day = "", month = "", year = ""] = (value || "").split(" ");
  return { day, month, year };
}

export function formatDateStr({ day, month, year }) {
  if (!day || !month || !year) {
    return [day, month, year].filter(Boolean).join(" ");
  }

  return `${day} ${month} ${year}`;
}

export function parseWeddingLocation(value) {
  const parts = String(value || "")
    .split(",")
    .map((item) => item.trim());

  if (parts.length === 2) {
    const [state = "", country = ""] = parts;
    return { country, state, city: "" };
  }

  const [city = "", state = "", country = ""] = parts;
  return { country, state, city };
}

export function createCorrelationId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `planner_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function roleToAccess(role) {
  return {
    role,
    canEdit: role === "owner" || role === "editor",
    canManageSharing: role === "owner",
  };
}

export function derivePlanAccess(plan, userEmail, fallbackRole = "owner") {
  const normalizedEmail = normalizeEmail(userEmail);

  if (!plan || !normalizedEmail || !Array.isArray(plan.collaborators)) {
    return roleToAccess(fallbackRole);
  }

  const role = plan.collaborators.find((item) => normalizeEmail(item.email) === normalizedEmail)?.role || fallbackRole;
  return roleToAccess(role);
}

export function mergeActivePlanCollection(currentItems, nextPlanItems, planId) {
  const nextItems = Array.isArray(nextPlanItems) ? nextPlanItems : [];
  const preservedItems = (Array.isArray(currentItems) ? currentItems : []).filter((item) => item?.planId !== planId);
  const normalizedPlanItems = nextItems
    .filter((item) => item && typeof item === "object")
    .map((item) => ({ ...item, planId }));

  return [...preservedItems, ...normalizedPlanItems];
}

export function applyWeddingToPlan(plan, nextWedding, nextPlanOverrides = {}) {
  return {
    ...plan,
    bride: nextWedding.bride || "",
    groom: nextWedding.groom || "",
    date: nextWedding.date || "",
    venue: nextWedding.venue || "",
    extraLocations: Array.isArray(nextPlanOverrides.extraLocations)
      ? nextPlanOverrides.extraLocations
      : (Array.isArray(plan.extraLocations) ? plan.extraLocations : []),
    guests: nextWedding.guests || "",
    budget: nextWedding.budget || "",
    websiteSettings: plan.websiteSettings || { ...DEFAULT_WEBSITE_SETTINGS },
  };
}

export function buildPlannerSnapshot({
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
}) {
  return {
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
  };
}

export function shouldShowOnboarding(nextPlanner) {
  const normalizedPlanner = normalizePlanner(nextPlanner);
  return !normalizedPlanner.onboardingCompleted && !hasWeddingProfile(normalizedPlanner.wedding);
}

export function resolvePlannerScreen(nextPlanner, options = {}) {
  const requiresOnboarding = shouldShowOnboarding(nextPlanner);

  if (options.forceOnboarding === true) {
    return "onboard";
  }

  return requiresOnboarding ? "splash" : "app";
}
