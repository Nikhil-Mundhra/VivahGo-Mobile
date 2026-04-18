export const PLANNER_TAB_SYNC_CHANNEL = "vivahgo.planner.tabSync";
export const PLANNER_TAB_SYNC_STORAGE_KEY = "vivahgo.planner.tabSync.message";
export const PLANNER_TAB_SYNC_MESSAGE_TYPE = "planner-snapshot";

function getWindowRef(options = {}) {
  return options.windowRef ?? (typeof window !== "undefined" ? window : null);
}

export function createPlannerTabId(prefix = "planner_tab") {
  const cryptoRef = typeof globalThis !== "undefined" ? globalThis.crypto : null;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return `${prefix}_${cryptoRef.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildPlannerTabSyncMessage({
  tabId,
  authMode,
  plannerOwnerId,
  activePlanId,
  plannerRevision,
  planner,
  timestamp,
} = {}) {
  return {
    type: PLANNER_TAB_SYNC_MESSAGE_TYPE,
    tabId: tabId || "",
    authMode: authMode || "",
    plannerOwnerId: plannerOwnerId || "",
    activePlanId: activePlanId || planner?.activePlanId || "",
    plannerRevision: Math.max(0, Number(plannerRevision) || 0),
    timestamp: Number(timestamp) || Date.now(),
    planner,
  };
}

export function shouldAcceptPlannerTabSyncMessage(message, context = {}) {
  if (!message || message.type !== PLANNER_TAB_SYNC_MESSAGE_TYPE) {
    return false;
  }

  if (!message.planner || typeof message.planner !== "object") {
    return false;
  }

  if (message.tabId && context.tabId && message.tabId === context.tabId) {
    return false;
  }

  if ((message.authMode || "") !== (context.authMode || "")) {
    return false;
  }

  if ((message.plannerOwnerId || "") !== (context.plannerOwnerId || "")) {
    return false;
  }

  return true;
}

export function publishPlannerTabSyncMessage(message, options = {}) {
  const windowRef = getWindowRef(options);
  if (!windowRef) {
    return;
  }

  if (typeof windowRef.BroadcastChannel === "function") {
    try {
      const channel = new windowRef.BroadcastChannel(PLANNER_TAB_SYNC_CHANNEL);
      channel.postMessage(message);
      if (typeof channel.close === "function") {
        channel.close();
      }
      return;
    } catch {
      // Fall through to storage when BroadcastChannel cannot be created.
    }
  }

  try {
    windowRef.localStorage?.setItem(PLANNER_TAB_SYNC_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Storage fallback is best-effort only.
  }
}

export function subscribeToPlannerTabSyncMessages(callback, options = {}) {
  const windowRef = getWindowRef(options);
  if (!windowRef || typeof callback !== "function") {
    return () => {};
  }

  let channel = null;

  if (typeof windowRef.BroadcastChannel === "function") {
    channel = new windowRef.BroadcastChannel(PLANNER_TAB_SYNC_CHANNEL);
    channel.onmessage = (event) => callback(event.data);
  }

  const handleStorage = (event) => {
    if (event.key !== PLANNER_TAB_SYNC_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      callback(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  };

  windowRef.addEventListener?.("storage", handleStorage);

  return () => {
    if (channel) {
      channel.onmessage = null;
      channel.close?.();
    }
    windowRef.removeEventListener?.("storage", handleStorage);
  };
}
