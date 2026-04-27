import { describe, expect, it } from "vitest";
import {
  getClerkRuntimeDiagnostics,
  isLocalHostname,
  isProductionClerkPublishableKey,
  resolveClerkFrontendApiHost,
  shouldEnableClerkRuntime,
} from "./clerkRuntime.js";

describe("clerkRuntime", () => {
  it("detects local development hostnames", () => {
    expect(isLocalHostname("localhost")).toBe(true);
    expect(isLocalHostname("127.0.0.1")).toBe(true);
    expect(isLocalHostname("vivahgo.com")).toBe(false);
  });

  it("detects production Clerk publishable keys", () => {
    expect(isProductionClerkPublishableKey("pk_live_example")).toBe(true);
    expect(isProductionClerkPublishableKey("pk_test_example")).toBe(false);
  });

  it("disables production Clerk keys on localhost", () => {
    expect(shouldEnableClerkRuntime({
      publishableKey: "pk_live_example",
      hostname: "localhost",
    })).toBe(false);
  });

  it("allows test Clerk keys on localhost and production keys on production hosts", () => {
    expect(shouldEnableClerkRuntime({
      publishableKey: "pk_test_example",
      hostname: "localhost",
    })).toBe(true);
    expect(shouldEnableClerkRuntime({
      publishableKey: "pk_live_example",
      hostname: "vivahgo.com",
    })).toBe(true);
  });

  it("decodes the Clerk frontend api host from the publishable key", () => {
    expect(resolveClerkFrontendApiHost("pk_live_Y2xlcmsudml2YWhnby5jb20k")).toBe("clerk.vivahgo.com");
  });

  it("builds consistent Clerk runtime diagnostics", () => {
    expect(getClerkRuntimeDiagnostics({
      publishableKey: "pk_live_Y2xlcmsudml2YWhnby5jb20k",
      hostname: "vivahgo.com",
      routePath: "/planner",
      clerkUnavailable: true,
      error: {
        name: "ClerkRuntimeError",
        message: "Failed to load Clerk JS",
        code: "failed_to_load_clerk_js",
      },
    })).toEqual(expect.objectContaining({
      publishableKeyPresent: true,
      publishableKeyType: "live",
      frontendApiHost: "clerk.vivahgo.com",
      hostname: "vivahgo.com",
      routePath: "/planner",
      clerkUnavailable: true,
      runtimeEnabled: true,
      errorName: "ClerkRuntimeError",
      errorCode: "failed_to_load_clerk_js",
    }));
  });
});
