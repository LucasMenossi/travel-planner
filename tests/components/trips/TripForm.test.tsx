// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TripForm } from "@/components/trips/TripForm";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
    back: vi.fn(),
  }),
}));

describe("TripForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors without submitting invalid dates", async () => {
    const user = userEvent.setup();

    render(<TripForm />);

    await user.type(screen.getByLabelText("Trip name"), "Japan 2027");
    await user.type(screen.getByLabelText("Destination"), "Tokyo, Japan");
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2027-04-17" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2027-04-10" },
    });
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(
      screen.getByText("End date must be on or after the start date."),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a trip and navigates to its details page", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "trip-123" }), { status: 200 }),
    );

    render(<TripForm />);

    await user.type(screen.getByLabelText("Trip name"), "Japan 2027");
    await user.type(screen.getByLabelText("Destination"), "Tokyo, Japan");
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2027-04-10" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2027-04-17" },
    });
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/trips",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(push).toHaveBeenCalledWith("/trips");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the API error when creating a trip fails", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Trip could not be created." }), {
        status: 400,
      }),
    );

    render(<TripForm />);

    await user.type(screen.getByLabelText("Trip name"), "Japan 2027");
    await user.type(screen.getByLabelText("Destination"), "Tokyo, Japan");
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2027-04-10" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2027-04-17" },
    });
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Trip could not be created.",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
