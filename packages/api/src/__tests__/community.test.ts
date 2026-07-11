import { randomUUID } from "node:crypto";

import { db } from "@hangouthub/db";
import { user } from "@hangouthub/db/schema/auth";
import { event, group } from "@hangouthub/db/schema/community";
import { createRouterClient } from "@orpc/server";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { appRouter } from "../routers/index";

/** Build an in-process oRPC client acting as a given user (or anonymous). */
function clientAs(
	session: { user: { id: string; name: string; email: string } } | null,
) {
	return createRouterClient(appRouter, {
		// biome-ignore lint/suspicious/noExplicitAny: test session shim
		context: async () => ({ auth: null, session }) as any,
	});
}

const u1 = {
	id: randomUUID(),
	name: "Ada Lovelace",
	email: `${randomUUID()}@test.dev`,
};
const u2 = {
	id: randomUUID(),
	name: "Alan Turing",
	email: `${randomUUID()}@test.dev`,
};
const groupSlug = `test-group-${randomUUID()}`;

let groupId = 0;
let createdEventId = 0;

beforeAll(async () => {
	await db.insert(user).values([
		{ id: u1.id, name: u1.name, email: u1.email, emailVerified: true },
		{ id: u2.id, name: u2.name, email: u2.email, emailVerified: true },
	]);
	const [g] = await db
		.insert(group)
		.values({
			slug: groupSlug,
			name: "Test Society",
			description: "A group created for integration tests.",
			category: "Tech",
			city: "Testville",
		})
		.returning();
	groupId = g.id;
});

afterAll(async () => {
	if (createdEventId)
		await db.delete(event).where(eq(event.id, createdEventId));
	await db.delete(group).where(eq(group.id, groupId));
	await db.delete(user).where(inArray(user.id, [u1.id, u2.id]));
});

describe("event lifecycle", () => {
	it("creates an event and auto-RSVPs the creator", async () => {
		const client = clientAs({ user: u1 });
		const created = await client.event.create({
			title: "Integration Test Meetup XYZ",
			description: "An event created during automated tests.",
			category: "Tech",
			venue: "Test Hall",
			city: "Testville",
			startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			capacity: 10,
			groupId,
		});
		createdEventId = created.id;

		expect(created.attendeeCount).toBe(1);
		expect(created.creatorId).toBe(u1.id);
		expect(created.emoji).toBe("💻"); // derived from Tech
	});

	it("returns the event with host group and viewer RSVP state", async () => {
		const created = await clientAs({ user: u1 }).event.getById({
			id: createdEventId,
		});
		expect(created?.group?.id).toBe(groupId);
		expect(created?.isAttending).toBe(true); // creator auto-RSVP'd
	});

	it("toggles a second user's RSVP and keeps the attendee count in sync", async () => {
		const client = clientAs({ user: u2 });
		const on = await client.event.toggleRsvp({ eventId: createdEventId });
		expect(on.attending).toBe(true);

		let detail = await client.event.getById({ id: createdEventId });
		expect(detail?.attendeeCount).toBe(2);
		expect(detail?.isAttending).toBe(true);

		const off = await client.event.toggleRsvp({ eventId: createdEventId });
		expect(off.attending).toBe(false);
		detail = await client.event.getById({ id: createdEventId });
		expect(detail?.attendeeCount).toBe(1);
	});

	it("finds the event via search", async () => {
		const results = await clientAs(null).event.getUpcoming({ q: "Meetup XYZ" });
		expect(results.some((e) => e.id === createdEventId)).toBe(true);
	});

	it("requires auth to RSVP", async () => {
		await expect(
			clientAs(null).event.toggleRsvp({ eventId: createdEventId }),
		).rejects.toThrow();
	});
});

describe("group membership", () => {
	it("joins and lists the group, updating the member count", async () => {
		const client = clientAs({ user: u1 });
		const before = await client.group.getById({ id: groupId });
		expect(before?.isMember).toBe(false);

		const res = await client.group.toggleMembership({ groupId });
		expect(res.member).toBe(true);

		const after = await client.group.getById({ id: groupId });
		expect(after?.isMember).toBe(true);
		expect(after?.memberCount).toBe((before?.memberCount ?? 0) + 1);

		const mine = await client.group.getMine();
		expect(mine.some((g) => g.id === groupId)).toBe(true);
	});
});

describe("comments", () => {
	it("posts and lists a comment with author info", async () => {
		const client = clientAs({ user: u2 });
		await client.comment.create({
			eventId: createdEventId,
			body: "See you all there!",
		});

		const comments = await clientAs(null).comment.list({
			eventId: createdEventId,
		});
		expect(comments[0]?.body).toBe("See you all there!");
		expect(comments[0]?.authorName).toBe(u2.name);
	});
});
