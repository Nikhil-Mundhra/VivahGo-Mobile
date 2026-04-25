import { useEffect, useRef } from "react";

const BACK_STATE_KEY = "__vivahgoModalToken";

function getBackStateToken(state) {
  if (!state || typeof state !== "object") {
    return null;
  }

  return typeof state[BACK_STATE_KEY] === "string" ? state[BACK_STATE_KEY] : null;
}

function shouldLogDebugEvents() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.__VIVAHGO_DEBUG_BACK_BUTTON__ === true
    || window.sessionStorage?.getItem("vivahgo.debugBackButton") === "1";
}

function logBackButtonEvent(label, event, payload = {}) {
  if (!shouldLogDebugEvents()) {
    return;
  }

  console.info(`[useBackButtonClose:${label}] ${event}`, payload);
}

/**
 * While `isOpen` is true, push a lightweight history entry so browser Back
 * closes the current form/modal before navigating away.
 */
export function useBackButtonClose(isOpen, onClose, options = {}) {
  const onCloseRef = useRef(onClose);
  const tokenRef = useRef(null);
  const ignoreNextPopStateRef = useRef(false);
  const shouldSkipHistoryBack = options.shouldSkipHistoryBack;
  const debugLabel = options.debugLabel || "modal";

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;

    const token = `modal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    tokenRef.current = token;

    window.history.pushState(
      { ...(window.history.state || {}), [BACK_STATE_KEY]: token },
      ""
    );
    logBackButtonEvent(debugLabel, "pushState", {
      token,
      historyToken: getBackStateToken(window.history.state),
    });

    function onPopState() {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        logBackButtonEvent(debugLabel, "ignore-popstate", {
          token: tokenRef.current,
          reason: "cleanup-history-back",
          historyToken: getBackStateToken(window.history.state),
        });
        return;
      }

      const activeToken = tokenRef.current;
      if (!activeToken) return;

      const historyToken = getBackStateToken(window.history.state);
      if (historyToken === activeToken) {
        logBackButtonEvent(debugLabel, "ignore-popstate", {
          token: activeToken,
          reason: "still-owning-history-entry",
          historyToken,
        });
        return;
      }

      tokenRef.current = null;
      logBackButtonEvent(debugLabel, "close-from-popstate", {
        token: activeToken,
        historyToken,
      });
      onCloseRef.current?.();
    }

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      // If the token is still set, the modal was closed normally (not via the
      // back button), so we need to pop the history entry we pushed to keep
      // back-button behaviour intuitive.
      const hadToken = !!tokenRef.current;
      const activeToken = tokenRef.current;
      const historyToken = getBackStateToken(window.history.state);
      const ownsCurrentHistoryEntry =
        historyToken === activeToken;
      const skipHistoryBack = !!shouldSkipHistoryBack?.();
      tokenRef.current = null;
      if (hadToken && ownsCurrentHistoryEntry) {
        if (skipHistoryBack) {
          const nextState = { ...(window.history.state || {}) };
          delete nextState[BACK_STATE_KEY];
          window.history.replaceState(nextState, "");
          logBackButtonEvent(debugLabel, "cleanup-replace-state", {
            token: activeToken,
            historyToken,
          });
        } else {
          ignoreNextPopStateRef.current = true;
          logBackButtonEvent(debugLabel, "cleanup-history-back", {
            token: activeToken,
            historyToken,
          });
          window.history.back();
        }
      } else if (hadToken) {
        logBackButtonEvent(debugLabel, "cleanup-noop", {
          token: activeToken,
          historyToken,
        });
      }
    };
  }, [debugLabel, isOpen, shouldSkipHistoryBack]);
}
