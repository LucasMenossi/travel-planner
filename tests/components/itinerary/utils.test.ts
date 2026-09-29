import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatShortDate,
  getTripDates,
} from "@/components/itinerary/utils";

describe("itinerary date utilities", () => {
  it("generates every date in the trip range", () => {
    expect(getTripDates("2027-04-10", "2027-04-13")).toEqual([
      "2027-04-10",
      "2027-04-11",
      "2027-04-12",
      "2027-04-13",
    ]);
  });

  it("handles a range that crosses a month boundary", () => {
    expect(getTripDates("2027-04-29", "2027-05-02")).toEqual([
      "2027-04-29",
      "2027-04-30",
      "2027-05-01",
      "2027-05-02",
    ]);
  });

  it("formats dates without timezone shifts", () => {
    expect(formatDate("2027-04-10")).toBe("Saturday, Apr 10");
    expect(formatShortDate("2027-04-10")).toBe("Sat, Apr 10");
  });
});
