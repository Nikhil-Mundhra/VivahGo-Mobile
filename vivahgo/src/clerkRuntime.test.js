import { describe, expect, it } from "vitest";
import {
  isLocalHostname,
  isProductionClerkPublishableKey,
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
});
