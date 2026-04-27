const PRELOAD_RECOVERY_STORAGE_KEY = "vivahgo.preloadRecovery";
const PRELOAD_RECOVERY_STATUS_KEY = "vivahgo.preloadRecoveryStatus";
const PRELOAD_ERROR_EVENT_NAME = "vite:preloadError";
const PRELOAD_FALLBACK_ROOT_ID = "root";

function getSessionStorageRef(win = typeof window !== "undefined" ? window : undefined) {
  return win?.sessionStorage || null;
}

function getLocationRef(win = typeof window !== "undefined" ? window : undefined) {
  return win?.location || null;
}

function getCurrentHref(win = typeof window !== "undefined" ? window : undefined) {
  return getLocationRef(win)?.href || "";
}

function getCurrentRoutePath(win = typeof window !== "undefined" ? window : undefined) {
  const locationRef = getLocationRef(win);
  if (!locationRef) {
    return "/";
  }

  return `${locationRef.pathname || "/"}${locationRef.search || ""}`;
}

function normalizeUrl(rawUrl, win = typeof window !== "undefined" ? window : undefined) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return null;
  }

  try {
    const locationRef = getLocationRef(win);
    const base = locationRef?.origin || "https://vivahgo.com";
    return new URL(rawUrl.trim(), base);
  } catch {
    return null;
  }
}

function extractAssetUrl(error, win = typeof window !== "undefined" ? window : undefined) {
  const directAssetUrl = typeof error?.assetUrl === "string" ? error.assetUrl : "";
  if (directAssetUrl) {
    return normalizeUrl(directAssetUrl, win);
  }

  const message = typeof error?.message === "string" ? error.message : "";
  const match = message.match(/Unable to preload CSS for\s+(.+)$/i);
  return normalizeUrl(match?.[1] || "", win);
}

function isSameOriginAssetUrl(assetUrl, win = typeof window !== "undefined" ? window : undefined) {
  const locationRef = getLocationRef(win);
  if (!assetUrl || !locationRef?.origin) {
    return false;
  }

  return assetUrl.origin === locationRef.origin && assetUrl.pathname.startsWith("/assets/");
}

function readRecoveryAttempt(storageRef = getSessionStorageRef()) {
  const rawValue = storageRef?.getItem?.(PRELOAD_RECOVERY_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeRecoveryAttempt(details, storageRef = getSessionStorageRef()) {
  storageRef?.setItem?.(PRELOAD_RECOVERY_STORAGE_KEY, JSON.stringify(details));
}

function writeRecoveryStatus(status, storageRef = getSessionStorageRef()) {
  storageRef?.setItem?.(PRELOAD_RECOVERY_STATUS_KEY, status);
}

function buildPreloadDiagnostics(error, options = {}) {
  const win = options.windowRef ?? (typeof window !== "undefined" ? window : undefined);
  const assetUrl = extractAssetUrl(error, win);
  const attempt = readRecoveryAttempt(getSessionStorageRef(win));
  const routePath = getCurrentRoutePath(win);
  const href = getCurrentHref(win);

  return {
    message: typeof error?.message === "string" ? error.message : "Unknown preload failure",
    assetUrl: assetUrl?.href || "",
    assetPath: assetUrl?.pathname || "",
    routePath,
    href,
    firstLoadAttempted: Boolean(attempt),
    recoveryAttempt: attempt,
    isSameOriginAsset: isSameOriginAssetUrl(assetUrl, win),
    errorName: typeof error?.name === "string" ? error.name : "Error",
  };
}

function getFallbackMarkup(details) {
  const assetText = details.assetPath || "a required app asset";
  return `
    <div class="app-page-fallback" role="alert" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="max-width:420px;text-align:center;">
        <h1 style="font-size:1.5rem;margin:0 0 0.75rem;">We hit a loading issue.</h1>
        <p style="margin:0 0 0.75rem;">VivahGo could not reload ${assetText}. Please refresh and try again.</p>
        <button type="button" data-preload-recovery-refresh="true" style="padding:0.75rem 1rem;border:0;border-radius:8px;background:#6b0f0f;color:#fff;font:inherit;cursor:pointer;">
          Refresh
        </button>
      </div>
    </div>
  `;
}

export function renderPreloadFailureFallback(details, options = {}) {
  const win = options.windowRef ?? (typeof window !== "undefined" ? window : undefined);
  const doc = options.documentRef ?? win?.document;
  const root = doc?.getElementById?.(PRELOAD_FALLBACK_ROOT_ID);
  if (!doc || !root) {
    return false;
  }

  root.innerHTML = getFallbackMarkup(details);
  const refreshButton = root.querySelector("[data-preload-recovery-refresh='true']");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      win?.location?.reload?.();
    });
  }
  return true;
}

export function installVitePreloadErrorHandler(options = {}) {
  const win = options.windowRef ?? (typeof window !== "undefined" ? window : undefined);
  if (!win || win.__VIVAHGO_PRELOAD_ERROR_HANDLER_INSTALLED__ === true) {
    return false;
  }

  const storageRef = getSessionStorageRef(win);
  const onRecoverableError = typeof options.onRecoverableError === "function" ? options.onRecoverableError : () => {};
  const onFatalError = typeof options.onFatalError === "function" ? options.onFatalError : () => {};
  const renderFallback = typeof options.renderFallback === "function" ? options.renderFallback : renderPreloadFailureFallback;
  const reload = typeof options.reload === "function"
    ? options.reload
    : () => {
      win.location?.reload?.();
    };

  const handlePreloadError = (event) => {
    const error = event?.payload instanceof Error
      ? event.payload
      : event?.payload && typeof event.payload === "object"
        ? event.payload
        : new Error(typeof event?.payload === "string" ? event.payload : "Unknown preload failure");
    const details = buildPreloadDiagnostics(error, { windowRef: win });
    if (!details.isSameOriginAsset) {
      return;
    }

    event?.preventDefault?.();

    if (!details.firstLoadAttempted) {
      writeRecoveryAttempt({
        assetUrl: details.assetUrl,
        assetPath: details.assetPath,
        routePath: details.routePath,
        href: details.href,
        attemptedAt: new Date().toISOString(),
      }, storageRef);
      writeRecoveryStatus("reloading", storageRef);
      onRecoverableError(details, error);
      reload();
      return;
    }

    writeRecoveryStatus("fallback", storageRef);
    onFatalError(details, error);
    renderFallback(details, { windowRef: win, documentRef: win.document });
  };

  win.addEventListener(PRELOAD_ERROR_EVENT_NAME, handlePreloadError);
  win.__VIVAHGO_PRELOAD_ERROR_HANDLER_INSTALLED__ = true;
  return true;
}

export {
  PRELOAD_ERROR_EVENT_NAME,
  PRELOAD_RECOVERY_STATUS_KEY,
  PRELOAD_RECOVERY_STORAGE_KEY,
  buildPreloadDiagnostics,
  readRecoveryAttempt,
};
