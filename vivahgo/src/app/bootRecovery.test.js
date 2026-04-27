import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PRELOAD_ERROR_EVENT_NAME,
  PRELOAD_RECOVERY_STATUS_KEY,
  PRELOAD_RECOVERY_STORAGE_KEY,
  buildPreloadDiagnostics,
  installVitePreloadErrorHandler,
} from "./bootRecovery.js";

describe("bootRecovery", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.innerHTML = '<div id="root"><div data-testid="app-shell">Planner shell</div></div>';
    window.history.replaceState({}, "", "/planner");
    delete window.__VIVAHGO_PRELOAD_ERROR_HANDLER_INSTALLED__;
  });

  it("reloads once for same-origin asset preload failures", () => {
    const onRecoverableError = vi.fn();
    const reload = vi.fn();

    installVitePreloadErrorHandler({
      onRecoverableError,
      reload,
      windowRef: window,
    });

    const event = new Event(PRELOAD_ERROR_EVENT_NAME, { cancelable: true });
    event.payload = new Error("Unable to preload CSS for /assets/api-B4EzxeA9.css");
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onRecoverableError).toHaveBeenCalledWith(expect.objectContaining({
      assetPath: "/assets/api-B4EzxeA9.css",
      routePath: "/planner",
      firstLoadAttempted: false,
    }), expect.any(Error));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(PRELOAD_RECOVERY_STATUS_KEY)).toBe("reloading");
    expect(JSON.parse(window.sessionStorage.getItem(PRELOAD_RECOVERY_STORAGE_KEY))).toEqual(expect.objectContaining({
      assetPath: "/assets/api-B4EzxeA9.css",
      routePath: "/planner",
    }));
  });

  it("renders a friendly fallback after a repeated same-origin asset preload failure", () => {
    const onFatalError = vi.fn();
    const reload = vi.fn();
    window.sessionStorage.setItem(PRELOAD_RECOVERY_STORAGE_KEY, JSON.stringify({
      assetPath: "/assets/api-B4EzxeA9.css",
      routePath: "/planner",
      attemptedAt: "2026-04-27T00:00:00.000Z",
    }));

    installVitePreloadErrorHandler({
      onFatalError,
      reload,
      windowRef: window,
    });

    const event = new Event(PRELOAD_ERROR_EVENT_NAME, { cancelable: true });
    event.payload = new Error("Unable to preload CSS for /assets/api-B4EzxeA9.css");
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(reload).not.toHaveBeenCalled();
    expect(onFatalError).toHaveBeenCalledWith(expect.objectContaining({
      assetPath: "/assets/api-B4EzxeA9.css",
      routePath: "/planner",
      firstLoadAttempted: true,
    }), expect.any(Error));
    expect(window.sessionStorage.getItem(PRELOAD_RECOVERY_STATUS_KEY)).toBe("fallback");
    expect(document.getElementById("root")?.textContent || "").toContain("We hit a loading issue.");
  });

  it("ignores non asset preload failures", () => {
    const onRecoverableError = vi.fn();
    const reload = vi.fn();

    installVitePreloadErrorHandler({
      onRecoverableError,
      reload,
      windowRef: window,
    });

    const event = new Event(PRELOAD_ERROR_EVENT_NAME, { cancelable: true });
    event.payload = new Error("Unable to preload CSS for https://example.com/assets/api.css");
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it("builds diagnostics from the current browser location", () => {
    const diagnostics = buildPreloadDiagnostics(
      new Error("Unable to preload CSS for /assets/api-B4EzxeA9.css"),
      { windowRef: window }
    );

    expect(diagnostics).toEqual(expect.objectContaining({
      assetPath: "/assets/api-B4EzxeA9.css",
      routePath: "/planner",
      isSameOriginAsset: true,
      firstLoadAttempted: false,
      href: expect.stringContaining("/planner"),
    }));
  });
});
