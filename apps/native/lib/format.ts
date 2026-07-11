const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function toDate(input: Date | string): Date {
	return input instanceof Date ? input : new Date(input);
}

function formatTime(date: Date): string {
	let hours = date.getHours();
	const minutes = date.getMinutes();
	const period = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;
	const mm = minutes.toString().padStart(2, "0");
	return `${hours}:${mm} ${period}`;
}

/** e.g. "Sat, Jul 13 · 6:00 AM" */
export function formatEventDateTime(input: Date | string): string {
	const date = toDate(input);
	return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()} · ${formatTime(date)}`;
}

/** Short two-line badge parts, e.g. { month: "JUL", day: "13" } */
export function formatDateBadge(input: Date | string): {
	month: string;
	day: string;
} {
	const date = toDate(input);
	return {
		month: MONTHS[date.getMonth()].toUpperCase(),
		day: date.getDate().toString(),
	};
}

/** Relative-ish label for how soon an event is. */
export function formatRelativeDay(input: Date | string): string {
	const date = toDate(input);
	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const startOfEvent = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);
	const diffDays = Math.round(
		(startOfEvent.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffDays <= 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays < 7) return `In ${diffDays} days`;
	if (diffDays < 14) return "Next week";
	return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. 3960 -> "4.0k", 640 -> "640" */
export function formatCount(value: number): string {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}k`;
	}
	return value.toString();
}

/** Time-of-day greeting. */
export function greeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}
