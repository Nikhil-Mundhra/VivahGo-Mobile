import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TasksScreen from "./TasksScreen.jsx";

const baseProps = {
  tasks: [
    { id: 1, name: "Book venue", done: false, due: "6 months before", group: "6 months", priority: "high", eventId: "", ceremony: "General" },
    { id: 2, name: "Confirm menu", done: true, due: "4 months before", group: "4 months", priority: "medium", eventId: "", ceremony: "General" },
  ],
  setTasks: vi.fn(),
  events: [],
  planId: "plan_test",
};

function FrameworkHarness({ onProgressUpdate = vi.fn(), ...props }) {
  const [frameworkProgress, setFrameworkProgress] = useState({ completedStepIds: [], answers: {}, encouragements: {} });

  function handleProgressUpdate(updater) {
    setFrameworkProgress((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      onProgressUpdate(next);
      return next;
    });
  }

  return (
    <TasksScreen
      {...baseProps}
      view="framework"
      wedding={{}}
      vendors={[]}
      expenses={[]}
      guests={[]}
      frameworkProgress={frameworkProgress}
      onUpdateFrameworkProgress={handleProgressUpdate}
      {...props}
    />
  );
}

describe("TasksScreen", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("keeps the checklist view and add task flow available", () => {
    render(<TasksScreen {...baseProps} view="checklist" />);

    expect(screen.getByText("Wedding Checklist")).toBeInTheDocument();
    expect(screen.getByText("1/2 tasks done")).toBeInTheDocument();
    expect(screen.getByText("Book venue")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));

    expect(screen.getByText("Add Task ✅")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What needs to be done?")).toBeInTheDocument();
  });

  it("renders the framework path, preview modal, and step detail screen", () => {
    const onProgressUpdate = vi.fn();

    render(<FrameworkHarness onProgressUpdate={onProgressUpdate} />);

    expect(screen.getByText("Your Wedding Blueprint")).toBeInTheDocument();
    expect(screen.getByText("The step-by-step foundation to plan your celebration with confidence.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "←" })).not.toBeInTheDocument();
    expect(screen.getByText("The Couple Brief")).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /The Big Three Priorities/ }));

    expect(screen.getByText("Set the tone, tradeoffs, and vendor style before money starts moving.")).toBeInTheDocument();
    expect(screen.getByText("3 min")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByText("Phase 1: The Couple Brief")).toBeInTheDocument();
    expect(screen.getByLabelText("Progress 0%")).toBeInTheDocument();
    expect(screen.getByText("What should feel unforgettable?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Answer questions first" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Food and hospitality/ }));
    expect(screen.getByText("Nice! Keep it up!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /Decor scale/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /The couple decides/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /Premium and polished/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByLabelText("Progress 100%")).toBeInTheDocument();
    expect(screen.getByText("All check-ins answered.")).toBeInTheDocument();

    expect(onProgressUpdate).toHaveBeenLastCalledWith({
      completedStepIds: ["big-three-priorities"],
      answers: {
        "big-three-priorities": {
          "top-priority": "food",
          "tradeoff-boundary": "decor",
          "decision-owner": "couple",
          "vendor-energy": "premium",
        },
      },
      encouragements: {
        "big-three-priorities": {
          "top-priority": "Nice! Keep it up!",
          "tradeoff-boundary": "Nice! Keep it up!",
          "decision-owner": "Nice! Keep it up!",
          "vendor-energy": "Nice! Keep it up!",
        },
      },
    });
  });

  it("keeps only skip and next actions in the question flow", () => {
    render(<FrameworkHarness />);

    fireEvent.click(screen.getByRole("button", { name: /The Budget/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save and complete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Wedding Plan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Guests" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Vendor Directory" })).not.toBeInTheDocument();
  });

  it("shows one question at a time and keeps skipped steps partially complete", () => {
    render(<FrameworkHarness />);

    fireEvent.click(screen.getByRole("button", { name: /The Big Three Priorities/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: /Food and hospitality/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("What is the top tradeoff you are willing to make?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.getByText("Paused with partial progress.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Answer questions first" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back to framework" }));
    expect(screen.getByRole("button", { name: /The Big Three Priorities/ }).className).toContain("partial");

    fireEvent.click(screen.getByRole("button", { name: /The Big Three Priorities/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByText("What is the top tradeoff you are willing to make?")).toBeInTheDocument();
  });
});
