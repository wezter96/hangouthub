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
