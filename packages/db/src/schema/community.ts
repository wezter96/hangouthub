import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
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
 * A scheduled meetup hosted by a group.
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
		startsAt: timestamp("starts_at").notNull(),
		capacity: integer("capacity").notNull().default(50),
		attendeeCount: integer("attendee_count").notNull().default(0),
		groupId: integer("group_id").references(() => group.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("event_startsAt_idx").on(table.startsAt)],
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
	],
);

export const groupRelations = relations(group, ({ many }) => ({
	events: many(event),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
	group: one(group, {
		fields: [event.groupId],
		references: [group.id],
	}),
	rsvps: many(rsvp),
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
