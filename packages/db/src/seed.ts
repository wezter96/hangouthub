import "./load-env";

import { sql } from "drizzle-orm";

import { db } from "./index";
import { event, group } from "./schema/community";

/** Returns a Date `days` days (and optional `hour`) from now. */
function daysFromNow(days: number, hour = 18): Date {
	const date = new Date();
	date.setDate(date.getDate() + days);
	date.setHours(hour, 0, 0, 0);
	return date;
}

const groups = [
	{
		slug: "downtown-hikers",
		name: "Downtown Hikers",
		description:
			"Weekend trail adventures for every skill level. We explore local parks, ridgelines and hidden waterfalls — no one gets left behind.",
		category: "Outdoors",
		city: "San Francisco, CA",
		emoji: "🥾",
		color: "#16A34A",
		memberCount: 1284,
	},
	{
		slug: "react-native-sf",
		name: "React Native SF",
		description:
			"The Bay Area meetup for mobile engineers. Talks, live coding and pizza — from Expo tips to shipping at scale.",
		category: "Tech",
		city: "San Francisco, CA",
		emoji: "⚛️",
		color: "#2563EB",
		memberCount: 3960,
	},
	{
		slug: "golden-gate-runners",
		name: "Golden Gate Runners",
		description:
			"Casual morning runs across the city's best routes. Coffee and good company guaranteed at the finish line.",
		category: "Fitness",
		city: "San Francisco, CA",
		emoji: "🏃",
		color: "#EA580C",
		memberCount: 872,
	},
	{
		slug: "sf-board-games",
		name: "SF Board Game Night",
		description:
			"Strategy, party games and everything in between. New faces welcome every week — we teach the rules.",
		category: "Social",
		city: "San Francisco, CA",
		emoji: "🎲",
		color: "#9333EA",
		memberCount: 640,
	},
	{
		slug: "bay-area-foodies",
		name: "Bay Area Foodies",
		description:
			"Pop-up dinners, tasting crawls and hole-in-the-wall discoveries with people who love to eat.",
		category: "Food",
		city: "Oakland, CA",
		emoji: "🍜",
		color: "#DB2777",
		memberCount: 2110,
	},
	{
		slug: "canvas-collective",
		name: "Canvas Collective",
		description:
			"Life drawing, gallery walks and messy paint nights for artists and the artist-curious.",
		category: "Arts",
		city: "San Francisco, CA",
		emoji: "🎨",
		color: "#0891B2",
		memberCount: 458,
	},
];

type SeedEvent = {
	groupSlug: string;
	title: string;
	description: string;
	category: string;
	venue: string;
	city: string;
	emoji: string;
	color: string;
	startsAt: Date;
	capacity: number;
	attendeeCount: number;
};

const events: SeedEvent[] = [
	{
		groupSlug: "downtown-hikers",
		title: "Sunrise Summit at Twin Peaks",
		description:
			"Beat the crowds and catch the city waking up from the top of Twin Peaks. A gentle 2-mile loop with the best skyline views in town. Bring a light jacket and a thermos.",
		category: "Outdoors",
		venue: "Twin Peaks Summit",
		city: "San Francisco, CA",
		emoji: "🌄",
		color: "#16A34A",
		startsAt: daysFromNow(2, 6),
		capacity: 40,
		attendeeCount: 27,
	},
	{
		groupSlug: "react-native-sf",
		title: "Shipping with Expo 57 — Live Demo Night",
		description:
			"Three lightning talks on the new Expo SDK, then an open live-coding jam. Whether you're building your first app or your fifth, come hack alongside the community.",
		category: "Tech",
		venue: "GitHub HQ — 88 Colin P Kelly Jr St",
		city: "San Francisco, CA",
		emoji: "⚛️",
		color: "#2563EB",
		startsAt: daysFromNow(4, 18),
		capacity: 120,
		attendeeCount: 94,
	},
	{
		groupSlug: "golden-gate-runners",
		title: "Saturday 5K Along the Embarcadero",
		description:
			"An easy, chatty 5K along the waterfront finishing at the Ferry Building for coffee. All paces welcome — walkers too.",
		category: "Fitness",
		venue: "Ferry Building Plaza",
		city: "San Francisco, CA",
		emoji: "🏃",
		color: "#EA580C",
		startsAt: daysFromNow(3, 8),
		capacity: 60,
		attendeeCount: 41,
	},
	{
		groupSlug: "sf-board-games",
		title: "Board Game Night: Euros & Party Games",
		description:
			"Wingspan, Codenames, Catan and a shelf full more. Drop in anytime — we'll teach you a game and find you a table.",
		category: "Social",
		venue: "The Tabletop Café — Valencia St",
		city: "San Francisco, CA",
		emoji: "🎲",
		color: "#9333EA",
		startsAt: daysFromNow(1, 19),
		capacity: 50,
		attendeeCount: 38,
	},
	{
		groupSlug: "bay-area-foodies",
		title: "Taco Crawl Through the Mission",
		description:
			"Five taquerías, one unforgettable night. We rate each stop and crown the best al pastor in the Mission. Come hungry.",
		category: "Food",
		venue: "Meet at 24th St BART",
		city: "San Francisco, CA",
		emoji: "🌮",
		color: "#DB2777",
		startsAt: daysFromNow(6, 18),
		capacity: 30,
		attendeeCount: 30,
	},
	{
		groupSlug: "canvas-collective",
		title: "Life Drawing & Wine",
		description:
			"A relaxed evening of figure drawing with a live model, good music and a glass of wine. Materials provided — just bring yourself.",
		category: "Arts",
		venue: "Mission Arts Studio",
		city: "San Francisco, CA",
		emoji: "🎨",
		color: "#0891B2",
		startsAt: daysFromNow(5, 19),
		capacity: 25,
		attendeeCount: 16,
	},
	{
		groupSlug: "downtown-hikers",
		title: "Lands End Coastal Trail Walk",
		description:
			"A scenic cliffside walk past the Sutro Baths ruins with sweeping views of the Golden Gate. Moderate pace, roughly 3.5 miles.",
		category: "Outdoors",
		venue: "Lands End Lookout",
		city: "San Francisco, CA",
		emoji: "🌊",
		color: "#16A34A",
		startsAt: daysFromNow(9, 10),
		capacity: 45,
		attendeeCount: 22,
	},
	{
		groupSlug: "react-native-sf",
		title: "Intro to oRPC & End-to-End Types",
		description:
			"A hands-on workshop on building fully type-safe APIs with oRPC. Bring a laptop — we'll wire a client and server together from scratch.",
		category: "Tech",
		venue: "Notion HQ — Mission St",
		city: "San Francisco, CA",
		emoji: "🔗",
		color: "#2563EB",
		startsAt: daysFromNow(11, 18),
		capacity: 80,
		attendeeCount: 53,
	},
];

async function seed() {
	console.log("🌱 Seeding HangoutHub…");

	// Clean slate so the seed is idempotent.
	// Reset all community tables and restart identity sequences so IDs are
	// clean and predictable on every seed.
	await db.execute(
		sql`TRUNCATE TABLE rsvp, membership, event, "group" RESTART IDENTITY CASCADE`,
	);

	const insertedGroups = await db.insert(group).values(groups).returning();
	const groupIdBySlug = new Map(insertedGroups.map((g) => [g.slug, g.id]));
	console.log(`  ✓ ${insertedGroups.length} groups`);

	const eventRows = events.map(({ groupSlug, ...rest }) => ({
		...rest,
		groupId: groupIdBySlug.get(groupSlug) ?? null,
	}));

	const insertedEvents = await db.insert(event).values(eventRows).returning();
	console.log(`  ✓ ${insertedEvents.length} events`);

	console.log("✅ Done.");
}

seed()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	});
