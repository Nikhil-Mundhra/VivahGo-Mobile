import { afterEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  decryptPlannerFromStorage,
  encryptPlannerForStorage,
} = require("../../api/_lib/core.js");

const originalPlannerEncryptionKey = process.env.PLANNER_ENCRYPTION_KEY;
const originalNodeEnv = process.env.NODE_ENV;

function buildPlanner() {
  return {
    activePlanId: "plan_1",
    marriages: [
      {
        id: "plan_1",
        bride: "Asha",
        groom: "Dev",
        date: "10 Feb 2027",
        venue: "Jaipur Palace",
        budget: "2500000",
        guests: "300",
        websiteSlug: "asha-dev-1",
        websiteSettings: {
          isActive: true,
          welcomeMessage: "Join us for the sangeet.",
        },
        frameworkProgress: {
          completedStepIds: ["budget-first-pass"],
          answers: { priorities: "food, music, hospitality" },
          encouragements: {},
        },
        extraLocations: ["Udaipur Lawn"],
        template: "traditional",
        collaborators: [
          {
            email: "owner@example.com",
            role: "owner",
            addedBy: "owner-id",
            addedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    ],
    wedding: {
      bride: "Asha",
      groom: "Dev",
      date: "10 Feb 2027",
      venue: "Jaipur Palace",
      guests: "300",
      budget: "2500000",
    },
    guests: [
      {
        id: "guest_1",
        planId: "plan_1",
        name: "Priya Sharma",
        phone: "+91 99999 99999",
        guestCount: 2,
      },
    ],
    expenses: [
      {
        id: "expense_1",
        planId: "plan_1",
        name: "Catering advance",
        amount: 750000,
        expenseDate: "2027-01-20",
      },
    ],
    events: [
      {
        id: "event_1",
        planId: "plan_1",
        name: "Sangeet",
        venue: "Jaipur Palace",
        isPublicWebsiteVisible: true,
      },
    ],
    vendors: [
      {
        id: "vendor_1",
        planId: "plan_1",
        name: "Royal Caterers",
        phone: "+91 88888 88888",
      },
    ],
    tasks: [
      {
        id: "task_1",
        planId: "plan_1",
        title: "Confirm menu",
        done: false,
      },
    ],
    customTemplates: [
      {
        id: "custom_1",
        name: "Family ceremony flow",
        description: "Private planner template",
        events: [{ name: "Tilak", sortOrder: 0 }],
      },
    ],
  };
}

afterEach(() => {
  if (originalPlannerEncryptionKey === undefined) {
    delete process.env.PLANNER_ENCRYPTION_KEY;
  } else {
    process.env.PLANNER_ENCRYPTION_KEY = originalPlannerEncryptionKey;
  }
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }
});

describe("planner field encryption", () => {
  it("leaves planner data unchanged when no encryption key is configured", () => {
    delete process.env.PLANNER_ENCRYPTION_KEY;
    const planner = buildPlanner();

    expect(encryptPlannerForStorage(planner)).toEqual(planner);
  });

  it("encrypts sensitive planner fields while preserving lookup fields", () => {
    process.env.PLANNER_ENCRYPTION_KEY = "test-planner-encryption-key";
    const planner = buildPlanner();

    const encrypted = encryptPlannerForStorage(planner);

    expect(encrypted.marriages[0].id).toBe("plan_1");
    expect(encrypted.marriages[0].websiteSlug).toBe("asha-dev-1");
    expect(encrypted.marriages[0].collaborators[0].email).toBe("owner@example.com");
    expect(encrypted.guests[0].id).toBe("guest_1");
    expect(encrypted.guests[0].planId).toBe("plan_1");

    expect(encrypted.marriages[0].bride).toMatch(/^vgenc:v1:/);
    expect(encrypted.marriages[0].websiteSettings.welcomeMessage).toMatch(/^vgenc:v1:/);
    expect(encrypted.wedding.budget).toMatch(/^vgenc:v1:/);
    expect(encrypted.guests[0].phone).toMatch(/^vgenc:v1:/);
    expect(encrypted.expenses[0].amount).toMatch(/^vgenc:v1:/);
    expect(encrypted.tasks[0].done).toMatch(/^vgenc:v1:/);

    expect(decryptPlannerFromStorage(encrypted)).toEqual(planner);
  });

  it("requires the encryption key when encrypted planner data is read", () => {
    process.env.PLANNER_ENCRYPTION_KEY = "test-planner-encryption-key";
    const encrypted = encryptPlannerForStorage(buildPlanner());

    delete process.env.PLANNER_ENCRYPTION_KEY;

    expect(() => decryptPlannerFromStorage(encrypted)).toThrow(/PLANNER_ENCRYPTION_KEY/);
  });

  it("requires an encryption key before storing planner data in production", () => {
    delete process.env.PLANNER_ENCRYPTION_KEY;
    process.env.NODE_ENV = "production";

    expect(() => encryptPlannerForStorage(buildPlanner())).toThrow(/PLANNER_ENCRYPTION_KEY/);
  });
});
