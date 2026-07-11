import { db } from "@hangouthub/db";
import { user } from "@hangouthub/db/schema/auth";
import { event, group, rsvp } from "@hangouthub/db/schema/community";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";
import { matchesQuery, metaForCategory } from "../lib/events";

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

	/** People going to an event (most recent RSVPs first). */
	getAttendees: publicProcedure
		.input(z.object({ eventId: z.number().int() }))
		.handler(async ({ input }) => {
			return await db
				.select({ id: user.id, name: user.name, image: user.image })
				.from(rsvp)
				.innerJoin(user, eq(user.id, rsvp.userId))
				.where(eq(rsvp.eventId, input.eventId))
				.orderBy(desc(rsvp.createdAt))
				.limit(24);
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
				imageUrl: z.string().url().nullable().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const meta = metaForCategory(input.category);

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
					imageUrl: input.imageUrl ?? null,
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
