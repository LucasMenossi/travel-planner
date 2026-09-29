// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DeleteTripButton } from "@/components/trips/DeleteTripButton";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

describe("DeleteTripButton", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("confirm", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  it("does not delete when the user cancels confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(confirm).mockReturnValue(false);

    render(<DeleteTripButton tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: "Delete trip" }));

    expect(confirm).toHaveBeenCalledWith(
      "Delete this trip? This will also remove its saved places and itinerary.",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deletes the trip and navigates after confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(confirm).mockReturnValue(true);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    render(<DeleteTripButton tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: "Delete trip" }));

    expect(fetch).toHaveBeenCalledWith("/api/trips/trip-1", {
      method: "DELETE",
    });
    expect(push).toHaveBeenCalledWith("/trips");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an error when deletion fails", async () => {
    const user = userEvent.setup();
    vi.mocked(confirm).mockReturnValue(true);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    render(<DeleteTripButton tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: "Delete trip" }));

    expect(alert).toHaveBeenCalledWith(
      "Could not delete the trip. Please try again.",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
