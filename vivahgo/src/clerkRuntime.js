export function isLocalHostname(hostname = "") {
  const normalized = String(hostname || "").trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function isProductionClerkPublishableKey(publishableKey = "") {
  return /^pk_live_/i.test(String(publishableKey || "").trim());
}

function decodeBase64Url(value = "") {
  const normalized = String(value || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!normalized) {
    return "";
  }

  const padding = normalized.length % 4;
  const padded = padding ? `${normalized}${"=".repeat(4 - padding)}` : normalized;

  try {
    if (typeof atob === "function") {
      return atob(padded);
    }
  } catch {
    // fall through to Buffer when available
  }

  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {
    // ignore invalid payloads
  }

  return "";
}

export function getCurrentHostname() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location?.hostname || "";
}

export function resolveClerkFrontendApiHost(publishableKey = "") {
  const key = String(publishableKey || "").trim();
  if (!key) {
    return "";
  }

  const encodedFrontendApi = key.split("_").slice(2).join("_");
  if (!encodedFrontendApi) {
    return "";
  }

  const decodedValue = decodeBase64Url(encodedFrontendApi);
  return decodedValue.replace(/\$+$/, "").trim();
}

export function shouldEnableClerkRuntime({ publishableKey = "", hostname = getCurrentHostname() } = {}) {
  const key = String(publishableKey || "").trim();
  if (!key) {
    return false;
  }

  if (isLocalHostname(hostname) && isProductionClerkPublishableKey(key)) {
    return false;
  }

  return true;
}

export function getClerkRuntimeDiagnostics({
  publishableKey = "",
  hostname = getCurrentHostname(),
  routePath = typeof window !== "undefined" ? `${window.location?.pathname || "/"}${window.location?.search || ""}` : "/",
  clerkUnavailable = false,
  error = null,
} = {}) {
  const key = String(publishableKey || "").trim();
  const frontendApiHost = resolveClerkFrontendApiHost(key);

  return {
    publishableKeyPresent: Boolean(key),
    publishableKeyType: key ? (isProductionClerkPublishableKey(key) ? "live" : "test") : "missing",
    frontendApiHost,
    hostname: String(hostname || "").trim().toLowerCase(),
    routePath,
    clerkUnavailable,
    runtimeEnabled: shouldEnableClerkRuntime({ publishableKey: key, hostname }),
    errorName: typeof error?.name === "string" ? error.name : "",
    errorMessage: typeof error?.message === "string" ? error.message : "",
    errorCode: typeof error?.code === "string"
      ? error.code
      : Array.isArray(error?.errors) && typeof error.errors[0]?.code === "string"
        ? error.errors[0].code
        : "",
  };
}
