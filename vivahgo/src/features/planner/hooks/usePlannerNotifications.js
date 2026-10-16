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
  const {
    authMode,
    authToken,
    notificationPreferences,
    setIsUpdatingNotifications,
    setNotificationError,
    setNotificationPreferences,
    setNotificationSupport,
  } = store;

  const notificationsQuery = useQuery({
    queryKey: plannerNotificationsQueryKey(),
    queryFn: () => fetchPlannerNotificationSettings(authToken),
    enabled: (authMode === "google" || authMode === "clerk") && Boolean(authToken),
  });

  const refreshBrowserNotificationState = useCallback(async () => {
    try {
      const support = await getBrowserNotificationSupport();
      setNotificationSupport(support);
    } catch {
      setNotificationSupport({ supported: false, configured: false, permission: "default" });
    }
  }, [setNotificationSupport]);

  const fetchAndApplyNotificationSettings = useCallback(async (token) => {
    if (!token) {
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    try {
      const response = await queryClient.fetchQuery({
        queryKey: plannerNotificationsQueryKey(),
        queryFn: () => fetchPlannerNotificationSettings(token),
      });
      setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || {}),
      });
    } catch {
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } finally {
      await refreshBrowserNotificationState();
    }
  }, [queryClient, refreshBrowserNotificationState, setNotificationPreferences]);

  async function handleSaveNotificationPreferences(nextPartial) {
    if (!authToken) {
      return;
    }

    const nextPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...notificationPreferences,
      ...nextPartial,
    };

    try {
      setIsUpdatingNotifications(true);
      setNotificationError("");
      setNotificationPreferences(nextPreferences);
      const response = await savePlannerNotificationSettings(authToken, nextPreferences);
      setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || nextPreferences),
      });
    } catch (error) {
      setNotificationError(error.message || "Could not save notification preferences.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  }

  async function handleEnableBrowserNotifications() {
    if (!authToken) {
      return;
    }

    try {
      setIsUpdatingNotifications(true);
      setNotificationError("");
      const token = await requestBrowserPushToken();
      const response = await registerPlannerNotificationToken(authToken, {
        token,
        platform: "web",
        deviceLabel: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "web-browser",
      });
      setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || notificationPreferences),
      });
      await refreshBrowserNotificationState();
    } catch (error) {
      setNotificationError(error.message || "Could not enable browser notifications.");
      await refreshBrowserNotificationState();
    } finally {
      setIsUpdatingNotifications(false);
    }
  }

  async function handleDisableBrowserNotifications() {
    if (!authToken) {
      return;
    }

    try {
      setIsUpdatingNotifications(true);
      setNotificationError("");
      let token = "";

      try {
        token = await requestBrowserPushToken();
      } catch {
        token = "";
      }

      await removeBrowserPushToken().catch(() => false);
      const response = token
        ? await removePlannerNotificationToken(authToken, { token })
        : await savePlannerNotificationSettings(authToken, {
          ...notificationPreferences,
          browserPushEnabled: false,
        });

      setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(response?.notificationPreferences || notificationPreferences),
        browserPushEnabled: false,
      });
      await refreshBrowserNotificationState();
    } catch (error) {
      setNotificationError(error.message || "Could not disconnect browser notifications.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  }

  useEffect(() => {
    if (!(authMode === "google" || authMode === "clerk") || !authToken) {
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    if (notificationsQuery.data) {
      setNotificationPreferences({
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(notificationsQuery.data.notificationPreferences || {}),
      });
    } else if (notificationsQuery.isError) {
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    }
  }, [authMode, authToken, notificationsQuery.data, notificationsQuery.isError, setNotificationPreferences]);

  useEffect(() => {
    if (!notificationsQuery.data && !notificationsQuery.isError) {
      return;
    }

    refreshBrowserNotificationState();
  }, [notificationsQuery.data, notificationsQuery.isError, refreshBrowserNotificationState]);

  useEffect(() => {
    getBrowserNotificationSupport()
      .then((support) => setNotificationSupport(support))
      .catch(() => setNotificationSupport({ supported: false, configured: false, permission: "default" }));
  }, [setNotificationSupport]);

  return {
    fetchAndApplyNotificationSettings,
    handleSaveNotificationPreferences,
    handleEnableBrowserNotifications,
    handleDisableBrowserNotifications,
  };
}
