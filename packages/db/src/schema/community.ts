import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

/**
 * A community / interest group that hosts events (e.g. "Downtown Hikers").
 */
export const group = pgTable("group", {
	id: serial("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(),
	city: text("city").notNull(),
	emoji: text("emoji").notNull().default("👥"),
	color: text("color").notNull().default("#6366F1"),
	memberCount: integer("member_count").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * A scheduled meetup hosted by a group and/or created by a user.
 */
export const event = pgTable(
	"event",
	{
		id: serial("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		category: text("category").notNull(),
		venue: text("venue").notNull(),
		city: text("city").notNull(),
		emoji: text("emoji").notNull().default("📅"),
		color: text("color").notNull().default("#6366F1"),
		imageUrl: text("image_url"),
		startsAt: timestamp("starts_at").notNull(),
		capacity: integer("capacity").notNull().default(50),
		attendeeCount: integer("attendee_count").notNull().default(0),
		groupId: integer("group_id").references(() => group.id, {
			onDelete: "set null",
		}),
		creatorId: text("creator_id").references(() => user.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("event_startsAt_idx").on(table.startsAt),
		index("event_creator_idx").on(table.creatorId),
	],
);

/**
 * A member's RSVP to an event.
 */
export const rsvp = pgTable(
	"rsvp",
	{
		id: serial("id").primaryKey(),
		eventId: integer("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("rsvp_event_idx").on(table.eventId),
		index("rsvp_user_idx").on(table.userId),
		unique("rsvp_event_user_unique").on(table.eventId, table.userId),
	],
);

/**
 * A user's membership in a group.
 */
export const membership = pgTable(
	"membership",
	{
		id: serial("id").primaryKey(),
		groupId: integer("group_id")
			.notNull()
			.references(() => group.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("membership_group_idx").on(table.groupId),
		index("membership_user_idx").on(table.userId),
		unique("membership_group_user_unique").on(table.groupId, table.userId),
	],
);

/**
 * A comment on an event's discussion thread.
 */
export const comment = pgTable(
	"comment",
	{
		id: serial("id").primaryKey(),
		eventId: integer("event_id")
			.notNull()
			.references(() => event.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("comment_event_idx").on(table.eventId)],
);

export const groupRelations = relations(group, ({ many }) => ({
	events: many(event),
	memberships: many(membership),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
	group: one(group, {
		fields: [event.groupId],
		references: [group.id],
	}),
	creator: one(user, {
		fields: [event.creatorId],
		references: [user.id],
	}),
	rsvps: many(rsvp),
	comments: many(comment),
}));

export const commentRelations = relations(comment, ({ one }) => ({
	event: one(event, {
		fields: [comment.eventId],
		references: [event.id],
	}),
	user: one(user, {
		fields: [comment.userId],
		references: [user.id],
	}),
}));

export const rsvpRelations = relations(rsvp, ({ one }) => ({
	event: one(event, {
		fields: [rsvp.eventId],
		references: [event.id],
	}),
	user: one(user, {
		fields: [rsvp.userId],
		references: [user.id],
	}),
}));

export const membershipRelations = relations(membership, ({ one }) => ({
	group: one(group, {
		fields: [membership.groupId],
		references: [group.id],
	}),
	user: one(user, {
		fields: [membership.userId],
		references: [user.id],
	}),
}));
