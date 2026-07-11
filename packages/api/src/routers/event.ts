import { db } from "@hangouthub/db";
import { event, group, rsvp } from "@hangouthub/db/schema/community";
import { and, asc, eq, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";

export const eventRouter = {
	/** Upcoming events, soonest first. Optionally filtered by category. */
	getUpcoming: publicProcedure
		.input(
			z
				.object({
					category: z.string().optional(),
					limit: z.number().int().positive().max(100).optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			const rows = await db.select().from(event).orderBy(asc(event.startsAt));

			const filtered =
				input?.category && input.category !== "All"
					? rows.filter((row) => row.category === input.category)
					: rows;

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
