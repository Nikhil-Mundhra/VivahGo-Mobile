import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestsScreen from "./GuestsScreen.jsx";
import { createGuestRsvpLink } from "../api.js";

vi.mock("../api.js", () => ({
  createGuestRsvpLink: vi.fn(),
}));

const baseGuest = {
  id: "guest_1",
  title: "Mr",
  firstName: "Rahul",
  middleName: "",
  lastName: "Mehta",
  side: "bride",
  phone: "+91 98765 43210",
  rsvp: "pending",
  guestCount: 1,
  groupMembers: [],
};

const baseProps = {
  guests: [baseGuest],
  setGuests: vi.fn(),
  planId: "plan_1",
  authToken: "token_1",
  plannerOwnerId: "owner_1",
};

function createPendingPromise() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

function mockWhatsAppWindow() {
  return {
    close: vi.fn(),
    location: { href: "" },
    opener: window,
  };
}

describe("GuestsScreen WhatsApp actions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    createGuestRsvpLink.mockReset();
  });

  it("opens a blank tab synchronously before navigating a single reminder to wa.me", async () => {
    const pendingRsvp = createPendingPromise();
    createGuestRsvpLink.mockReturnValueOnce(pendingRsvp.promise);
    const openedWindow = mockWhatsAppWindow();
    const openSpy = vi.spyOn(window, "open").mockReturnValueOnce(openedWindow);

    render(<GuestsScreen {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Send WhatsApp reminder" }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith("about:blank", "_blank");
    expect(openedWindow.location.href).toBe("");

    pendingRsvp.resolve({
      rsvpUrl: "https://vivahgo.com/rsvp/abc123",
      coupleName: "Priya & Kabir",
    });

    await waitFor(() => {
      expect(openedWindow.location.href).toContain("https://wa.me/919876543210?text=");
    });
    expect(decodeURIComponent(openedWindow.location.href)).toContain("Dear *Mr Rahul Mehta*");
    expect(decodeURIComponent(openedWindow.location.href)).toContain("https://vivahgo.com/rsvp/abc123");
    expect(decodeURIComponent(openedWindow.location.href)).toContain("Priya & Kabir");
    expect(createGuestRsvpLink).toHaveBeenCalledWith("token_1", {
      guestId: "guest_1",
      planId: "plan_1",
      plannerOwnerId: "owner_1",
    });
  });

  it("uses the same wa.me popup-safe flow for bulk WhatsApp messages", async () => {
    createGuestRsvpLink.mockResolvedValueOnce({
      rsvpUrl: "https://vivahgo.com/rsvp/bulk123",
      coupleName: "Priya & Kabir",
    });
    const openedWindow = mockWhatsAppWindow();
    const openSpy = vi.spyOn(window, "open").mockReturnValueOnce(openedWindow);

    render(<GuestsScreen {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Bulk Message/ }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(openSpy).toHaveBeenCalledWith("about:blank", "_blank");

    await waitFor(() => {
      expect(openedWindow.location.href).toContain("https://wa.me/919876543210?text=");
    });
    expect(decodeURIComponent(openedWindow.location.href)).toContain("Dear *Mr Rahul Mehta*");
    expect(decodeURIComponent(openedWindow.location.href)).toContain("https://vivahgo.com/rsvp/bulk123");
    expect(screen.getByRole("button", { name: "✓ Sent" })).toBeInTheDocument();
  });
});
