import { isLocalHostname, isPlannerHostname, normalizeHostname, shouldRenderMarketingHomeAtRoot } from "../../siteUrls.js";

export const QUERY_CAPTURE_PAGE_SLUGS = [
  "wedding-planner-app",
  "wedding-checklist-app",
  "wedding-budget-planner-app",
  "guest-list-rsvp-app",
  "wedding-vendor-manager-app",
  "indian-wedding-budget-template",
  "free-wedding-budget-template",
  "wedding-guest-list-template",
  "for-wedding-planners",
];

export const PLANNER_TAB_PATHS = {
  dashboard: "home",
  events: "events",
  budget: "budget",
  guests: "guests",
  vendors: "vendors",
  tasks: "tasks",
};

export const PLANNER_TAB_IDS = Object.values(PLANNER_TAB_PATHS);

export function normalizePathname(pathname = "/") {
  return pathname.replace(/\/+$/, "") || "/";
}

export function getRouteInfo(pathname = "/", options = {}) {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedHostname = normalizeHostname(options.hostname || "");
  const isAuthenticated = options.isAuthenticated === true;
  const redirectPath = isPlannerHostname(normalizedHostname) && normalizedPathname === "/vendor" && !isAuthenticated
    ? "/"
    : "";
  const canonicalPathname = redirectPath || normalizedPathname;
  const isRootMarketingHomeRoute = canonicalPathname === "/" && shouldRenderMarketingHomeAtRoot(normalizedHostname);
  const isLocalPlannerRoute = isLocalHostname(normalizedHostname) && canonicalPathname === "/planner";
  const localPlannerTabMatch = isLocalHostname(normalizedHostname) ? canonicalPathname.match(/^\/planner\/([^/]+)$/) : null;
  const plannerHostTabMatch = isPlannerHostname(normalizedHostname) ? canonicalPathname.match(/^\/([^/]+)$/) : null;
  const plannerTabPath = decodeURIComponent((localPlannerTabMatch?.[1] || plannerHostTabMatch?.[1] || "")).toLowerCase();
  const plannerTab = PLANNER_TAB_PATHS[plannerTabPath] || "";
  const isPlannerRoute = isPlannerHostname(normalizedHostname)
    ? canonicalPathname === "/" || Boolean(plannerTab)
    : isLocalPlannerRoute || Boolean(plannerTab);
  const isMarketingHomeAliasRoute = canonicalPathname === "/home" && !isPlannerHostname(normalizedHostname);
  const isMarketingHomeRoute = isRootMarketingHomeRoute || isMarketingHomeAliasRoute;
  const isPricingRoute = canonicalPathname === "/pricing";
  const isTermsRoute = canonicalPathname === "/terms";
  const isPrivacyRoute = canonicalPathname === "/privacy-policy";
  const isDataDeletionRoute = canonicalPathname === "/data-deletion-instructions";
  const isGuidesRoute = canonicalPathname === "/guides";
  const guideMatch = canonicalPathname.match(/^\/guides\/([^/]+)$/);
  const guideSlug = guideMatch ? decodeURIComponent(guideMatch[1]) : "";
  const queryPageMatch = canonicalPathname.match(/^\/([^/]+)$/);
  const queryPageSlug = queryPageMatch && QUERY_CAPTURE_PAGE_SLUGS.includes(queryPageMatch[1])
    ? decodeURIComponent(queryPageMatch[1])
    : "";
  const isCareersRoute = canonicalPathname === "/careers";
  const isWeddingWebsiteRoute = canonicalPathname === "/wedding";
  const rsvpMatch = canonicalPathname.match(/^\/rsvp\/([^/]+)$/);
  const rsvpToken = rsvpMatch ? decodeURIComponent(rsvpMatch[1]) : "";
  const isVendorRoute = canonicalPathname === "/vendor";
  const isAdminRoute = canonicalPathname === "/admin" || canonicalPathname.startsWith("/admin/");
  const isClerkSsoCallbackRoute = canonicalPathname === "/auth/sso-callback";
  const publicWeddingSlugMatch = canonicalPathname.match(/^\/([^/.][^/]*)$/);
  const publicWeddingSlug = publicWeddingSlugMatch
    && !queryPageSlug
    && !isPlannerHostname(normalizedHostname)
    && !["home", "planner", "pricing", "terms", "privacy-policy", "data-deletion-instructions", "guides", "rsvp", "vendor", "wedding", "admin", "careers"].includes(publicWeddingSlugMatch[1].toLowerCase())
    ? decodeURIComponent(publicWeddingSlugMatch[1])
    : "";

  const bodyRoute = isMarketingHomeRoute || isPricingRoute || isTermsRoute || isPrivacyRoute || isDataDeletionRoute || isGuidesRoute || guideSlug || queryPageSlug ? "home"
    : rsvpToken ? "rsvp"
    : isWeddingWebsiteRoute ? "wedding"
    : isCareersRoute ? "careers"
    : isVendorRoute ? "vendor"
    : isAdminRoute ? "admin"
    : isClerkSsoCallbackRoute ? "app"
    : publicWeddingSlug ? "wedding"
    : "app";

  return {
    normalizedPathname,
    canonicalPathname,
    normalizedHostname,
    redirectPath,
    isRootMarketingHomeRoute,
    isLocalPlannerRoute,
    isPlannerRoute,
    plannerTab,
    isMarketingHomeRoute,
    isPricingRoute,
    isTermsRoute,
    isPrivacyRoute,
    isDataDeletionRoute,
    isGuidesRoute,
    guideSlug,
    queryPageSlug,
    isCareersRoute,
    isWeddingWebsiteRoute,
    rsvpToken,
    isVendorRoute,
    isAdminRoute,
    isClerkSsoCallbackRoute,
    publicWeddingSlug,
    bodyRoute,
  };
}
