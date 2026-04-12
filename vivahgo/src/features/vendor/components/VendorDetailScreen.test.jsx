import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VendorDetailScreen from "./VendorDetailScreen.jsx";

const baseVendor = {
  id: "vendor_1",
  name: "Royal Catering Co.",
  type: "Catering",
  city: "Jaipur",
  emoji: "🍽️",
  rating: 5,
  services: ["Regional menus", "Live counters"],
  locations: ["Jaipur"],
  reviews: [],
  testimonials: [],
  budgetRange: { min: 200000, max: 800000 },
  whatsappNumber: "91 98765 43210",
};

describe("VendorDetailScreen", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses the provided Blueprint outreach message for the WhatsApp request button", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      <VendorDetailScreen
        vendor={baseVendor}
        onBack={() => {}}
        onToggleWishlist={() => {}}
        onAddReview={() => {}}
        requestServiceMessage="Hi, we are planning a wedding in Jaipur. I found Royal Catering Co. on VivahGo. We need Jain-friendly live counters."
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Request Service via WhatsApp/ }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target, features] = openSpy.mock.calls[0];
    expect(url).toContain("https://wa.me/919876543210?text=");
    expect(decodeURIComponent(url)).toContain("Jain-friendly live counters");
    expect(decodeURIComponent(url)).toContain("Royal Catering Co.");
    expect(target).toBe("_blank");
    expect(features).toBe("noopener,noreferrer");
  });
});
