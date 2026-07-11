import { db } from "@hangouthub/db";
import { event, group, rsvp } from "@hangouthub/db/schema/community";
import { and, asc, eq, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";

/** Emoji + color applied to a new event based on its category. */
const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
	Tech: { emoji: "💻", color: "#2563EB" },
	Outdoors: { emoji: "🌲", color: "#16A34A" },
	Fitness: { emoji: "🏋️", color: "#EA580C" },
	Food: { emoji: "🍽️", color: "#DB2777" },
	Social: { emoji: "🎉", color: "#9333EA" },
	Arts: { emoji: "🎨", color: "#0891B2" },
};
const DEFAULT_META = { emoji: "📅", color: "#F1435E" };

function matchesQuery(
	row: { title: string; venue: string; description: string; city: string },
	q: string,
): boolean {
	const needle = q.trim().toLowerCase();
	if (!needle) return true;
	return (
		row.title.toLowerCase().includes(needle) ||
		row.venue.toLowerCase().includes(needle) ||
		row.city.toLowerCase().includes(needle) ||
		row.description.toLowerCase().includes(needle)
	);
}

export const eventRouter = {
	/** Upcoming events, soonest first. Optionally filtered by category and text. */
	getUpcoming: publicProcedure
		.input(
			z
				.object({
					category: z.string().optional(),
					q: z.string().optional(),
					limit: z.number().int().positive().max(100).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			const rows = await db.select().from(event).orderBy(asc(event.startsAt));
			const cutoff = Date.now() - 3 * 60 * 60 * 1000; // keep events until ~3h after start

			let filtered = rows.filter(
				(row) => new Date(row.startsAt).getTime() >= cutoff,
			);
			if (input?.category && input.category !== "All") {
				filtered = filtered.filter((row) => row.category === input.category);
			}
			if (input?.q) {
				filtered = filtered.filter((row) =>
					matchesQuery(row, input.q as string),
				);
			}

			return input?.limit ? filtered.slice(0, input.limit) : filtered;
		}),

	/** A single event with its host group and the viewer's RSVP state. */
	getById: publicProcedure
		.input(z.object({ id: z.number().int() }))
		.handler(async ({ input, context }) => {
			const [found] = await db
				.select()
				.from(event)
				.where(eq(event.id, input.id))
				.limit(1);
			if (!found) {
				return null;
			}

			const host = found.groupId
				? ((
						await db
							.select()
							.from(group)
							.where(eq(group.id, found.groupId))
							.limit(1)
					)[0] ?? null)
				: null;

			let isAttending = false;
			const userId = context.session?.user?.id;
			if (userId) {
				const [existing] = await db
					.select()
					.from(rsvp)
					.where(and(eq(rsvp.eventId, input.id), eq(rsvp.userId, userId)))
					.limit(1);
				isAttending = Boolean(existing);
			}

			return { ...found, group: host, isAttending };
		}),

	/** Events the current user has RSVP'd to, soonest first. Requires auth. */
	getMine: protectedProcedure.handler(async ({ context }) => {
		const rows = await db
			.select()
			.from(event)
			.innerJoin(rsvp, eq(rsvp.eventId, event.id))
			.where(eq(rsvp.userId, context.session.user.id))
			.orderBy(asc(event.startsAt));
		return rows.map((row) => row.event);
	}),

	/** Events the current user created/hosts, soonest first. Requires auth. */
	getHosting: protectedProcedure.handler(async ({ context }) => {
		return await db
			.select()
			.from(event)
			.where(eq(event.creatorId, context.session.user.id))
			.orderBy(asc(event.startsAt));
	}),

	/** Create an event. The creator is auto-RSVP'd. Requires auth. */
	create: protectedProcedure
		.input(
			z.object({
				title: z.string().trim().min(3).max(120),
				description: z.string().trim().min(10).max(2000),
				category: z.string().min(1),
				venue: z.string().trim().min(2).max(160),
				city: z.string().trim().min(2).max(120),
				startsAt: z.coerce.date(),
				capacity: z.number().int().min(2).max(1000),
				groupId: z.number().int().nullable().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const meta = CATEGORY_META[input.category] ?? DEFAULT_META;

			const [created] = await db
				.insert(event)
				.values({
					title: input.title,
					description: input.description,
					category: input.category,
					venue: input.venue,
					city: input.city,
					emoji: meta.emoji,
					color: meta.color,
					startsAt: input.startsAt,
					capacity: input.capacity,
					attendeeCount: 1,
					groupId: input.groupId ?? null,
					creatorId: context.session.user.id,
				})
				.returning();

			if (!created) {
				throw new Error("Failed to create event");
			}

			// Auto-RSVP the creator.
			await db
				.insert(rsvp)
				.values({ eventId: created.id, userId: context.session.user.id });

			return created;
		}),

	/** Toggle the current user's RSVP for an event. Requires auth. */
	toggleRsvp: protectedProcedure
		.input(z.object({ eventId: z.number().int() }))
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;

			const [existing] = await db
				.select()
				.from(rsvp)
				.where(and(eq(rsvp.eventId, input.eventId), eq(rsvp.userId, userId)))
				.limit(1);

			if (existing) {
				await db.delete(rsvp).where(eq(rsvp.id, existing.id));
				await db
					.update(event)
					.set({ attendeeCount: sql`GREATEST(${event.attendeeCount} - 1, 0)` })
					.where(eq(event.id, input.eventId));
				return { attending: false };
			}

			await db.insert(rsvp).values({ eventId: input.eventId, userId });
			await db
				.update(event)
				.set({ attendeeCount: sql`${event.attendeeCount} + 1` })
				.where(eq(event.id, input.eventId));
			return { attending: true };
		}),
};
