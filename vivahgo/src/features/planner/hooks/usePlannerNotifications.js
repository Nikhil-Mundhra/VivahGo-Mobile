import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPlannerNotificationSettings,
  plannerNotificationsQueryKey,
  registerPlannerNotificationToken,
  removePlannerNotificationToken,
  savePlannerNotificationSettings,
} from "../api.js";
import { getBrowserNotificationSupport, removeBrowserPushToken, requestBrowserPushToken } from "../../../firebaseMessaging.js";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../lib/plannerShellState.js";

export function usePlannerNotifications({ store, queryClient }) {
  const notificationsQuery = useQuery({
    queryKey: plannerNotificationsQueryKey(),
    queryFn: () => fetchPlannerNotificationSettings(store.authToken),
    enabled: (store.authMode === "google" || store.authMode === "clerk") && Boolean(store.authToken),
  });

  const refreshBrowserNotificationState = useCallback(async () => {
    try {
      const support = await getBrowserNotificationSupport();
      store.setNotificationSupport(support);
    } catch {
      store.setNotificationSupport({ supported: false, configured: false, permission: "default" });
    }
  }, [store]);

  const fetchAndApplyNotificationSettings = useCallback(async (token) => {
    if (!token) {
      store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    try {
      const response = await queryClient.fetchQuery({
        queryKey: plannerNotificationsQueryKey(),
        queryFn: () => fetchPlannerNotificationSettings(token),
      });
      store.setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || {}),
      });
    } catch {
      store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } finally {
      await refreshBrowserNotificationState();
    }
  }, [queryClient, refreshBrowserNotificationState, store]);

  async function handleSaveNotificationPreferences(nextPartial) {
    if (!store.authToken) {
      return;
    }

    const nextPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...store.notificationPreferences,
      ...nextPartial,
    };

    try {
      store.setIsUpdatingNotifications(true);
      store.setNotificationError("");
      store.setNotificationPreferences(nextPreferences);
      const response = await savePlannerNotificationSettings(store.authToken, nextPreferences);
      store.setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || nextPreferences),
      });
    } catch (error) {
      store.setNotificationError(error.message || "Could not save notification preferences.");
    } finally {
      store.setIsUpdatingNotifications(false);
    }
  }

  async function handleEnableBrowserNotifications() {
    if (!store.authToken) {
      return;
    }

    try {
      store.setIsUpdatingNotifications(true);
      store.setNotificationError("");
      const token = await requestBrowserPushToken();
      const response = await registerPlannerNotificationToken(store.authToken, {
        token,
        platform: "web",
        deviceLabel: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "web-browser",
      });
      store.setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || store.notificationPreferences),
      });
      await refreshBrowserNotificationState();
    } catch (error) {
      store.setNotificationError(error.message || "Could not enable browser notifications.");
      await refreshBrowserNotificationState();
    } finally {
      store.setIsUpdatingNotifications(false);
    }
  }

  async function handleDisableBrowserNotifications() {
    if (!store.authToken) {
      return;
    }

    try {
      store.setIsUpdatingNotifications(true);
      store.setNotificationError("");
      let token = "";

      try {
        token = await requestBrowserPushToken();
      } catch {
        token = "";
      }

      await removeBrowserPushToken().catch(() => false);
      const response = token
        ? await removePlannerNotificationToken(store.authToken, { token })
        : await savePlannerNotificationSettings(store.authToken, {
          ...store.notificationPreferences,
          browserPushEnabled: false,
        });

      store.setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || store.notificationPreferences),
        browserPushEnabled: false,
      });
      await refreshBrowserNotificationState();
    } catch (error) {
      store.setNotificationError(error.message || "Could not disconnect browser notifications.");
    } finally {
      store.setIsUpdatingNotifications(false);
    }
  }

  useEffect(() => {
    if (!(store.authMode === "google" || store.authMode === "clerk") || !store.authToken) {
      store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    if (notificationsQuery.data) {
      store.setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(notificationsQuery.data.notificationPreferences || {}),
      });
    } else if (notificationsQuery.isError) {
      store.setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    }
  }, [notificationsQuery.data, notificationsQuery.isError, store.authMode, store.authToken, store]);

  useEffect(() => {
    if (!notificationsQuery.data && !notificationsQuery.isError) {
      return;
    }

    refreshBrowserNotificationState();
  }, [notificationsQuery.data, notificationsQuery.isError, refreshBrowserNotificationState]);

  useEffect(() => {
    getBrowserNotificationSupport()
      .then((support) => store.setNotificationSupport(support))
      .catch(() => store.setNotificationSupport({ supported: false, configured: false, permission: "default" }));
  }, [store]);

  return {
    fetchAndApplyNotificationSettings,
    handleSaveNotificationPreferences,
    handleEnableBrowserNotifications,
    handleDisableBrowserNotifications,
  };
}
