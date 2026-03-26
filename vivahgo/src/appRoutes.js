export function normalizePathname(pathname = "/") {
  return pathname.replace(/\/+$/, "") || "/";
}

export function getRouteInfo(pathname = "/") {
  const normalizedPathname = normalizePathname(pathname);
  const isMarketingHomeRoute = /^\/home\/?$/.test(pathname);
  const isCareersRoute = /^\/careers\/?$/.test(pathname);
  const isWeddingWebsiteRoute = /^\/wedding\/?$/.test(pathname);
  const isVendorRoute = /^\/vendor\/?$/.test(pathname);
  const isAdminRoute = /^\/admin\/?$/.test(pathname);
  const publicWeddingSlugMatch = normalizedPathname.match(/^\/([^/.][^/]*)$/);
  const publicWeddingSlug = publicWeddingSlugMatch && !["home", "vendor", "wedding", "admin", "careers"].includes(publicWeddingSlugMatch[1].toLowerCase())
    ? decodeURIComponent(publicWeddingSlugMatch[1])
    : "";

  const bodyRoute = isMarketingHomeRoute ? "home"
    : isWeddingWebsiteRoute ? "wedding"
    : isCareersRoute ? "careers"
    : isVendorRoute ? "vendor"
    : isAdminRoute ? "admin"
    : publicWeddingSlug ? "wedding"
    : "app";

  return {
    normalizedPathname,
    isMarketingHomeRoute,
    isCareersRoute,
    isWeddingWebsiteRoute,
    isVendorRoute,
    isAdminRoute,
    publicWeddingSlug,
    bodyRoute,
  };
}
