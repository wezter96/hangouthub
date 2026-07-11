import { describe, expect, it } from "vitest";

import { DEFAULT_META, matchesQuery, metaForCategory } from "./events";

describe("metaForCategory", () => {
	it("returns known category meta", () => {
		expect(metaForCategory("Tech")).toEqual({ emoji: "💻", color: "#2563EB" });
		expect(metaForCategory("Food").color).toBe("#DB2777");
	});

	it("falls back to the default for unknown categories", () => {
		expect(metaForCategory("Nonexistent")).toEqual(DEFAULT_META);
	});
});

describe("matchesQuery", () => {
	const row = {
		title: "Sunrise Summit at Twin Peaks",
		venue: "Twin Peaks Summit",
		description: "A gentle loop with skyline views.",
		city: "San Francisco, CA",
	};

	it("matches on title, venue, city and description, case-insensitively", () => {
		expect(matchesQuery(row, "sunrise")).toBe(true);
		expect(matchesQuery(row, "TWIN PEAKS")).toBe(true);
		expect(matchesQuery(row, "francisco")).toBe(true);
		expect(matchesQuery(row, "skyline")).toBe(true);
	});

	it("returns true for empty queries and false for non-matches", () => {
		expect(matchesQuery(row, "")).toBe(true);
		expect(matchesQuery(row, "   ")).toBe(true);
		expect(matchesQuery(row, "kayaking")).toBe(false);
	});
});
