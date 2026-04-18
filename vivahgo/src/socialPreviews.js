import socialPreviewConfig from "./shared/content/social-previews.json" with { type: "json" };

function normalizeHostname(hostname = "") {
  return String(hostname || "").trim().toLowerCase().replace(/:\d+$/, "");
}

function normalizePathname(pathname = "/") {
  const value = String(pathname || "/").trim();
  if (!value) {
    return "/";
  }

  try {
    const parsed = new URL(value, "https://vivahgo.com");
    return parsed.pathname || "/";
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

function matchesHost(pattern = "", hostname = "") {
  const normalizedPattern = normalizeHostname(pattern);
  const normalizedHostname = normalizeHostname(hostname);
  if (!normalizedPattern || !normalizedHostname) {
    return false;
  }

  if (normalizedPattern.startsWith("*.")) {
    const suffix = normalizedPattern.slice(1);
    return normalizedHostname.endsWith(suffix) && normalizedHostname !== normalizedPattern.slice(2);
  }

  return normalizedPattern === normalizedHostname;
}

function matchesPath(prefix = "/", pathname = "/") {
  const normalizedPrefix = normalizePathname(prefix);
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPrefix === "/" || normalizedPathname === normalizedPrefix || normalizedPathname.startsWith(`${normalizedPrefix.replace(/\/$/, "")}/`);
}

export function getSocialPreview(previewKey = socialPreviewConfig.defaultPreview) {
  const key = socialPreviewConfig.previews?.[previewKey] ? previewKey : socialPreviewConfig.defaultPreview;
  const preview = socialPreviewConfig.previews?.[key];
  return {
    key,
    path: preview?.path || "/social-preview.png",
    type: preview?.type || "image/png",
    width: String(preview?.width || "1200"),
    height: String(preview?.height || "630"),
    alt: preview?.alt || "VivahGo wedding planning preview",
  };
}

export function resolveSocialPreview(options = {}) {
  if (options.previewKey) {
    return getSocialPreview(options.previewKey);
  }

  const hostname = normalizeHostname(options.hostname);
  const pathname = normalizePathname(options.pathname);
  const matchedRule = (socialPreviewConfig.rules || []).find((rule) => {
    const hostMatched = !rule.hosts?.length || rule.hosts.some((host) => matchesHost(host, hostname));
    const pathMatched = !rule.pathPrefixes?.length || rule.pathPrefixes.some((prefix) => matchesPath(prefix, pathname));
    return hostMatched && pathMatched;
  });

  return getSocialPreview(matchedRule?.preview || socialPreviewConfig.defaultPreview);
}
