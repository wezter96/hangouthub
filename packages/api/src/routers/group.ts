import { db } from "@hangouthub/db";
import { event, group, membership } from "@hangouthub/db/schema/community";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";

export const groupRouter = {
	/** All groups, most popular first. Optional text search. */
	getAll: publicProcedure
		.input(z.object({ q: z.string().optional() }).optional())
		.handler(async ({ input }) => {
			const rows = await db
				.select()
				.from(group)
				.orderBy(desc(group.memberCount));
			const needle = input?.q?.trim().toLowerCase();
			if (!needle) return rows;
			return rows.filter(
				(row) =>
					row.name.toLowerCase().includes(needle) ||
					row.category.toLowerCase().includes(needle) ||
					row.city.toLowerCase().includes(needle),
			);
		}),

	/** A single group with its upcoming events and the viewer's membership. */
	getById: publicProcedure
		.input(z.object({ id: z.number().int() }))
		.handler(async ({ input, context }) => {
			const [found] = await db
				.select()
				.from(group)
				.where(eq(group.id, input.id))
				.limit(1);
			if (!found) return null;

			const events = await db
				.select()
				.from(event)
				.where(eq(event.groupId, input.id))
				.orderBy(asc(event.startsAt));

			let isMember = false;
			const userId = context.session?.user?.id;
			if (userId) {
				const [existing] = await db
					.select()
					.from(membership)
					.where(
						and(
							eq(membership.groupId, input.id),
							eq(membership.userId, userId),
						),
					)
					.limit(1);
				isMember = Boolean(existing);
			}

			return { ...found, events, isMember };
		}),

	/** Groups the current user has joined. Requires auth. */
	getMine: protectedProcedure.handler(async ({ context }) => {
		const rows = await db
			.select()
			.from(group)
			.innerJoin(membership, eq(membership.groupId, group.id))
			.where(eq(membership.userId, context.session.user.id))
			.orderBy(desc(group.memberCount));
		return rows.map((row) => row.group);
	}),

	/** Join or leave a group. Requires auth. */
	toggleMembership: protectedProcedure
		.input(z.object({ groupId: z.number().int() }))
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;

			const [existing] = await db
				.select()
				.from(membership)
				.where(
					and(
						eq(membership.groupId, input.groupId),
						eq(membership.userId, userId),
					),
				)
				.limit(1);

			if (existing) {
				await db.delete(membership).where(eq(membership.id, existing.id));
				await db
					.update(group)
					.set({ memberCount: sql`GREATEST(${group.memberCount} - 1, 0)` })
					.where(eq(group.id, input.groupId));
				return { member: false };
			}

			await db.insert(membership).values({ groupId: input.groupId, userId });
			await db
				.update(group)
				.set({ memberCount: sql`${group.memberCount} + 1` })
				.where(eq(group.id, input.groupId));
			return { member: true };
		}),
};
