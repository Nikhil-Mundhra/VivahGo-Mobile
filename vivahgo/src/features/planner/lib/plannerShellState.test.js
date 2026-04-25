import { describe, expect, it } from "vitest";
import { createBlankPlanner, createDemoPlanner } from "../../../plannerDefaults.js";
import { resolvePlannerScreen, shouldShowOnboarding } from "./plannerShellState.js";

describe("plannerShellState", () => {
  it("keeps completed demo planners out of onboarding", () => {
    const demoPlanner = createDemoPlanner();

    expect(shouldShowOnboarding(demoPlanner)).toBe(false);
    expect(resolvePlannerScreen(demoPlanner)).toBe("app");
  });

  it("routes blank planners through the splash handoff", () => {
    const blankPlanner = createBlankPlanner();

    expect(shouldShowOnboarding(blankPlanner)).toBe(true);
    expect(resolvePlannerScreen(blankPlanner)).toBe("splash");
  });

  it("can explicitly force onboarding from a setup handoff", () => {
    const blankPlanner = createBlankPlanner();

    expect(resolvePlannerScreen(blankPlanner, { forceOnboarding: true })).toBe("onboard");
  });
});
