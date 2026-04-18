export function isLocalHostname(hostname = "") {
  const normalized = String(hostname || "").trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function isProductionClerkPublishableKey(publishableKey = "") {
  return /^pk_live_/i.test(String(publishableKey || "").trim());
}

export function getCurrentHostname() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location?.hostname || "";
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
