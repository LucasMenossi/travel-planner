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
  });

  it("does not delete when the user cancels confirmation", async () => {
    const user = userEvent.setup();

    render(<DeleteTripButton tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: "Delete trip" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete this trip?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deletes the trip and navigates after confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    render(<DeleteTripButton tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: "Delete trip" }));
    await user.click(screen.getByRole("button", { name: "Delete trip" }));

    expect(fetch).toHaveBeenCalledWith("/api/trips/trip-1", {
      method: "DELETE",
    });
    expect(push).toHaveBeenCalledWith("/trips");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an inline error when deletion fails", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    render(<DeleteTripButton tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: "Delete trip" }));
    await user.click(screen.getByRole("button", { name: "Delete trip" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not delete the trip. Please try again.",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
