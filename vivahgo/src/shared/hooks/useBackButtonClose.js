import { useEffect, useRef } from "react";

const BACK_STATE_KEY = "__vivahgoModalToken";

/**
 * While `isOpen` is true, push a lightweight history entry so browser Back
 * closes the current form/modal before navigating away.
 */
export function useBackButtonClose(isOpen, onClose, options = {}) {
  const onCloseRef = useRef(onClose);
  const tokenRef = useRef(null);
  const ignoreNextPopStateRef = useRef(false);
  const shouldSkipHistoryBack = options.shouldSkipHistoryBack;

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

    function onPopState() {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }

      if (!tokenRef.current) return;
      tokenRef.current = null;
      onCloseRef.current?.();
    }

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      // If the token is still set, the modal was closed normally (not via the
      // back button), so we need to pop the history entry we pushed to keep
      // back-button behaviour intuitive.
      const hadToken = !!tokenRef.current;
      const ownsCurrentHistoryEntry =
        window.history.state &&
        window.history.state[BACK_STATE_KEY] === tokenRef.current;
      const skipHistoryBack = !!shouldSkipHistoryBack?.();
      tokenRef.current = null;
      if (hadToken && ownsCurrentHistoryEntry) {
        if (skipHistoryBack) {
          const nextState = { ...(window.history.state || {}) };
          delete nextState[BACK_STATE_KEY];
          window.history.replaceState(nextState, "");
        } else {
          ignoreNextPopStateRef.current = true;
          window.history.back();
        }
      }
    };
  }, [isOpen, shouldSkipHistoryBack]);
}
