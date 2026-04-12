import { describe, expect, it } from "vitest";
import { VENDOR_TYPES } from "../../../constants.js";
import {
  addPlannerFrameworkCompletedStep,
  buildPlannerFrameworkVendorBrief,
  buildPlannerFramework,
  getPlannerFrameworkCompletionMap,
  getPlannerFrameworkStepMinutes,
  normalizePlannerFrameworkProgress,
  PLANNER_FRAMEWORK_PHASES,
  setPlannerFrameworkAnswer,
} from "./plannerFramework.js";

describe("plannerFramework", () => {
  it("pre-ticks wedding detail steps from onboarding fields", () => {
    const completionMap = getPlannerFrameworkCompletionMap({
      wedding: {
        date: "10 Dec 2026",
        venue: "Jai Mahal Palace, Jaipur",
        guests: "320",
        budget: "6500000",
      },
    });

    expect(completionMap["auspicious-timing"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["venue-stay"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["budget-distribution"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["guest-event-matrix"]).toEqual({ isComplete: true, source: "derived" });
  });

  it("pre-ticks vendor and expense represented steps", () => {
    const completionMap = getPlannerFrameworkCompletionMap({
      vendors: [
        { type: "Wedding Planners", status: "booked" },
        { type: "Wedding Transportation", status: "pending" },
        { type: "Pandit", status: "pending" },
        { type: "Photography", status: "pending" },
        { type: "Wedding Videography", status: "pending" },
        { type: "Music", status: "pending" },
        { type: "Wedding DJ", status: "pending" },
        { type: "Wedding Entertainment", status: "pending" },
        { type: "Bridal & Pre-Bridal", status: "pending" },
        { type: "Groom Services", status: "pending" },
        { type: "Choreographer", status: "pending" },
        { type: "Wedding Decorators", status: "pending" },
        { type: "Florists", status: "pending" },
        { type: "Tent House", status: "pending" },
        { type: "Wedding Cakes", status: "pending" },
        { type: "Photobooth", status: "pending" },
        { type: "Wedding Invitations", status: "pending" },
        { type: "Wedding Gifts", status: "pending" },
      ],
      expenses: [
        { category: "catering", amount: 50000 },
        { category: "attire", amount: 20000 },
      ],
    });

    expect(completionMap["planner-coordination"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["transport-hospitality"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["ritual-guidance"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["makeup-hair"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["bridal-groom-styling"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["photo-video"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["catering-bar"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["decor-florals-tent"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["cake-dessert"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["music-dj-entertainment"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap.choreography).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["photobooth-extras"]).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap.invitations).toEqual({ isComplete: true, source: "derived" });
    expect(completionMap["gifts-hampers"]).toEqual({ isComplete: true, source: "derived" });
  });

  it("maps framework vendor metadata to known vendor types", () => {
    const knownTypes = new Set(VENDOR_TYPES.filter(type => type !== "All"));
    const vendorTypes = PLANNER_FRAMEWORK_PHASES
      .flatMap(phase => phase.steps)
      .flatMap(step => step.vendorTypes || []);

    expect(vendorTypes.length).toBeGreaterThan(0);
    expect(vendorTypes.every(type => knownTypes.has(type))).toBe(true);
  });

  it("keeps manual completions unique and limited to known framework steps", () => {
    const progress = addPlannerFrameworkCompletedStep({
      completedStepIds: ["big-three-priorities", "budget", "guest-matrix", "attire-jewelry", "missing-step"],
    }, "big-three-priorities");
    const nextProgress = addPlannerFrameworkCompletedStep(progress, "makeup-hair");

    expect(nextProgress).toEqual({
      completedStepIds: [
        "big-three-priorities",
        "budget-distribution",
        "guest-event-matrix",
        "bridal-groom-styling",
        "makeup-hair",
      ],
      answers: {},
      encouragements: {},
    });
    expect(normalizePlannerFrameworkProgress({ completedStepIds: ["unknown"] })).toEqual({
      completedStepIds: [],
      answers: {},
      encouragements: {},
    });
  });

  it("stores only valid framework MCQ answers", () => {
    const progress = setPlannerFrameworkAnswer(
      { completedStepIds: [] },
      "big-three-priorities",
      "top-priority",
      "food"
    );
    const nextProgress = setPlannerFrameworkAnswer(progress, "missing-step", "top-priority", "music");

    expect(nextProgress).toEqual({
      completedStepIds: [],
      answers: {
        "big-three-priorities": {
          "top-priority": "food",
        },
      },
      encouragements: {
        "big-three-priorities": {
          "top-priority": "Nice! Keep it up!",
        },
      },
    });
    expect(normalizePlannerFrameworkProgress({
      completedStepIds: [],
      answers: {
        "big-three-priorities": {
          "top-priority": "food",
          missing: "food",
        },
        "budget-distribution": {
          "host-distribution": "joint",
          missing: "joint",
        },
      },
      encouragements: {
        "big-three-priorities": {
          "top-priority": "Nice! Keep it up!",
          missing: "Nope",
        },
      },
    })).toEqual({
      completedStepIds: [],
      answers: {
        "big-three-priorities": {
          "top-priority": "food",
        },
        "budget-distribution": {
          "host-distribution": "joint",
        },
      },
      encouragements: {
        "big-three-priorities": {
          "top-priority": "Nice! Keep it up!",
        },
      },
    });
  });

  it("reports the first incomplete step for the framework path", () => {
    const framework = buildPlannerFramework({
      frameworkProgress: { completedStepIds: ["big-three-priorities"] },
    });

    expect(framework.phases).toHaveLength(6);
    expect(framework.totalCount).toBe(19);
    expect(framework.completedCount).toBe(1);
    expect(framework.firstIncompleteId).toBe("auspicious-timing");
    expect(framework.allSteps.find(step => step.id === "big-three-priorities").questionCount).toBe(4);
    expect(framework.allSteps.find(step => step.id === "big-three-priorities").minutes).toBe(3);
  });

  it("calculates step minutes from question types", () => {
    expect(getPlannerFrameworkStepMinutes({
      questions: [
        { id: "one", type: "mcq" },
        { id: "two" },
      ],
    })).toBe(2);
    expect(getPlannerFrameworkStepMinutes({
      questions: [
        { id: "one", type: "dropdown" },
        { id: "two", type: "openEnded" },
      ],
    })).toBe(3);
  });

  it("builds a deterministic venue outreach brief from planner answers", () => {
    let progress = { completedStepIds: [], answers: {}, encouragements: {} };
    progress = setPlannerFrameworkAnswer(progress, "auspicious-timing", "date-flexibility", "few-options");
    progress = setPlannerFrameworkAnswer(progress, "guest-event-matrix", "event-attendance", "intimate-to-grand");
    progress = setPlannerFrameworkAnswer(progress, "venue-stay", "venue-type", "residential");
    progress = setPlannerFrameworkAnswer(progress, "venue-stay", "room-block", "buyout");

    const brief = buildPlannerFrameworkVendorBrief({
      vendorType: "Venue",
      wedding: { date: "10 Dec 2026", venue: "Jaipur", guests: "320", budget: "6500000" },
      frameworkProgress: progress,
    });

    expect(brief.message).toContain("10 Dec 2026");
    expect(brief.message).toContain("Jaipur");
    expect(brief.message).toContain("320 guests");
    expect(brief.message).toContain("A few date options");
    expect(brief.message).toContain("Residential / Destination");
    expect(brief.message).toContain("Full property buyout");
    expect(brief.message).toContain("shortlisting within a clear budget range");
    expect(brief.message).not.toContain("6500000");
    expect(brief.questions.join(" ")).toContain("spaces, room commitments");
  });

  it("builds vendor-specific catering, photo, and planner brief details", () => {
    let progress = { completedStepIds: [], answers: {}, encouragements: {} };
    progress = setPlannerFrameworkAnswer(progress, "catering-bar", "food-direction", "global-live");
    progress = setPlannerFrameworkAnswer(progress, "catering-bar", "dietary-coverage", "jain");
    progress = setPlannerFrameworkAnswer(progress, "photo-video", "coverage-scope", "all-events");
    progress = setPlannerFrameworkAnswer(progress, "photo-video", "deliverables", "same-day-edit");
    progress = setPlannerFrameworkAnswer(progress, "planner-coordination", "planning-scope", "full-planning");

    const cateringBrief = buildPlannerFrameworkVendorBrief({ vendorType: "Catering", frameworkProgress: progress });
    const photoBrief = buildPlannerFrameworkVendorBrief({ vendorType: "Photography", frameworkProgress: progress });
    const plannerBrief = buildPlannerFrameworkVendorBrief({
      vendorType: "Wedding Planners",
      wedding: { budget: "6500000" },
      frameworkProgress: progress,
    });

    expect(cateringBrief.message).toContain("Global and live counters");
    expect(cateringBrief.message).toContain("Jain and no onion/garlic");
    expect(photoBrief.message).toContain("Every function");
    expect(photoBrief.message).toContain("Same-day edit or reels");
    expect(plannerBrief.message).toContain("Full planning");
    expect(plannerBrief.message).not.toContain("6500000");
  });
});
