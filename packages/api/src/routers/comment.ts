import { db } from "@hangouthub/db";
import { user } from "@hangouthub/db/schema/auth";
import { comment } from "@hangouthub/db/schema/community";
import { desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";

export const commentRouter = {
	/** Comments on an event, newest first, with author info. */
	list: publicProcedure
		.input(z.object({ eventId: z.number().int() }))
		.handler(async ({ input }) => {
			const rows = await db
				.select({
					id: comment.id,
					body: comment.body,
					createdAt: comment.createdAt,
					authorName: user.name,
					authorImage: user.image,
				})
				.from(comment)
				.innerJoin(user, eq(user.id, comment.userId))
				.where(eq(comment.eventId, input.eventId))
				.orderBy(desc(comment.createdAt))
				.limit(100);
			return rows;
		}),

	/** Post a comment to an event. Requires auth. */
	create: protectedProcedure
		.input(
			z.object({
				eventId: z.number().int(),
				body: z.string().trim().min(1).max(1000),
			}),
		)
		.handler(async ({ input, context }) => {
			const [created] = await db
				.insert(comment)
				.values({
					eventId: input.eventId,
					userId: context.session.user.id,
					body: input.body,
				})
				.returning();
			return created;
		}),
};
