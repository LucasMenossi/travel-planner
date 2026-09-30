// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ItineraryForm } from "@/components/itinerary/ItineraryForm";
import type { ItineraryItem } from "@/components/itinerary/types";
import type { SavedPlace } from "@/lib/places/types";

const places: SavedPlace[] = [
  {
    id: "place-1",
    externalId: "external-1",
    name: "Senso-ji",
    address: "Tokyo",
    latitude: 35.7148,
    longitude: 139.7967,
    category: "tourism.sights",
    imageUrl: null,
    createdAt: "2027-04-10T10:00:00.000Z",
  },
];

const existingItems: ItineraryItem[] = [
  {
    id: "item-1",
    date: "2027-04-10",
    position: 0,
    title: "Morning activity",
    startTime: "10:00",
    endTime: "12:00",
    notes: null,
    placeId: null,
    placeName: null,
  },
];

describe("ItineraryForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("prevents saving an activity when its time overlaps another activity", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(
      <ItineraryForm
        tripId="trip-1"
        places={places}
        existingItems={existingItems}
        date="2027-04-10"
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Activity"), "Visit temple");
    await user.type(screen.getByLabelText("Start time"), "11:00");
    await user.type(screen.getByLabelText("End time"), "13:00");
    await user.click(screen.getByRole("button", { name: "Add activity" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This time overlaps with “Morning activity”.",
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("allows adjacent activities and saves the new item", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: "item-2",
            tripId: "trip-1",
            date: "2027-04-10",
            position: 1,
            title: "Lunch",
            startTime: "12:00",
            endTime: "13:00",
            notes: null,
            placeId: "place-1",
          },
        }),
        { status: 200 },
      ),
    );

    render(
      <ItineraryForm
        tripId="trip-1"
        places={places}
        existingItems={existingItems}
        date="2027-04-10"
        onSaved={onSaved}
        onCancel={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Activity"), "Lunch");
    await user.selectOptions(screen.getByLabelText("Saved place"), "place-1");
    await user.type(screen.getByLabelText("Start time"), "12:00");
    await user.type(screen.getByLabelText("End time"), "13:00");
    await user.click(screen.getByRole("button", { name: "Add activity" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/trips/trip-1/itinerary",
      expect.objectContaining({ method: "POST" }),
    );
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "item-2",
        placeName: "Senso-ji",
      }),
    );
  });

  it("shows a server error when saving fails", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Unable to save activity." }), {
        status: 409,
      }),
    );

    render(
      <ItineraryForm
        tripId="trip-1"
        places={places}
        existingItems={[]}
        date="2027-04-10"
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Activity"), "Dinner");
    await user.click(screen.getByRole("button", { name: "Add activity" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to save activity.",
    );
  });
});
