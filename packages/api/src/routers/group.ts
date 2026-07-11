import { db } from "@hangouthub/db";
import { group } from "@hangouthub/db/schema/community";
import { desc } from "drizzle-orm";

import { publicProcedure } from "../index";

export const groupRouter = {
	/** All groups, most popular first. */
	getAll: publicProcedure.handler(async () => {
		return await db.select().from(group).orderBy(desc(group.memberCount));
	}),
};
