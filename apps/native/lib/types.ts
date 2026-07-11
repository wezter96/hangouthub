import type { AppRouterClient } from "@hangouthub/api/routers/index";

/** A single event as returned by the upcoming-events endpoint. */
export type EventListItem = Awaited<
	ReturnType<AppRouterClient["event"]["getUpcoming"]>
>[number];

/** A single event with its host group, from the detail endpoint. */
export type EventDetail = NonNullable<
	Awaited<ReturnType<AppRouterClient["event"]["getById"]>>
>;

/** A community group. */
export type GroupItem = Awaited<
	ReturnType<AppRouterClient["group"]["getAll"]>
>[number];

/** A group with its events + membership state, from the detail endpoint. */
export type GroupDetail = NonNullable<
	Awaited<ReturnType<AppRouterClient["group"]["getById"]>>
>;

/** A person attending an event. */
export type EventAttendee = Awaited<
	ReturnType<AppRouterClient["event"]["getAttendees"]>
>[number];

/** A comment on an event. */
export type EventComment = Awaited<
	ReturnType<AppRouterClient["comment"]["list"]>
>[number];
