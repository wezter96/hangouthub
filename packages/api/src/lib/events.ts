/** Emoji + color applied to a new event based on its category. */
export const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
	Tech: { emoji: "💻", color: "#2563EB" },
	Outdoors: { emoji: "🌲", color: "#16A34A" },
	Fitness: { emoji: "🏋️", color: "#EA580C" },
	Food: { emoji: "🍽️", color: "#DB2777" },
	Social: { emoji: "🎉", color: "#9333EA" },
	Arts: { emoji: "🎨", color: "#0891B2" },
};

export const DEFAULT_META = { emoji: "📅", color: "#F1435E" };

/** Resolve the emoji/color for a category, falling back to a default. */
export function metaForCategory(category: string): {
	emoji: string;
	color: string;
} {
	return CATEGORY_META[category] ?? DEFAULT_META;
}

type Searchable = {
	title: string;
	venue: string;
	description: string;
	city: string;
};

/** True when `q` matches any of the event's searchable text fields. */
export function matchesQuery(row: Searchable, q: string): boolean {
	const needle = q.trim().toLowerCase();
	if (!needle) return true;
	return (
		row.title.toLowerCase().includes(needle) ||
		row.venue.toLowerCase().includes(needle) ||
		row.city.toLowerCase().includes(needle) ||
		row.description.toLowerCase().includes(needle)
	);
}
