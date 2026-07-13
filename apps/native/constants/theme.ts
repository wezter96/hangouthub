import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/** HangoutHub brand color — a refined coral used for primary actions. */
export const BRAND = "#EC4863";
export const BRAND_DARK = "#D23555";

/** Warm sunset gradient used on the hero, primary buttons and accents. */
export const BRAND_GRADIENT = ["#FF8A5B", "#EC4863"] as const;

/** Display serif font families (loaded in the root layout). */
export const FONT = {
	display: "Fraunces_600SemiBold",
	displayMedium: "Fraunces_500Medium",
	displayBold: "Fraunces_700Bold",
} as const;

export type Category = {
	label: string;
	icon: IoniconName;
	color: string;
	/** Two-stop gradient for cover fallbacks. */
	gradient: readonly [string, string];
};

/** Discovery categories. "All" is the default, unfiltered view. */
export const CATEGORIES: Category[] = [
	{
		label: "All",
		icon: "sparkles",
		color: BRAND,
		gradient: ["#FF8A5B", "#EC4863"],
	},
	{
		label: "Tech",
		icon: "hardware-chip",
		color: "#5B6CF0",
		gradient: ["#6E8BFF", "#5B4BE0"],
	},
	{
		label: "Outdoors",
		icon: "leaf",
		color: "#2E9E6B",
		gradient: ["#4FBF87", "#1F8A5B"],
	},
	{
		label: "Fitness",
		icon: "barbell",
		color: "#F0803C",
		gradient: ["#FFA24E", "#EC6A2C"],
	},
	{
		label: "Food",
		icon: "restaurant",
		color: "#E8547E",
		gradient: ["#FF7EA0", "#DB3F6C"],
	},
	{
		label: "Social",
		icon: "game-controller",
		color: "#8B5CF6",
		gradient: ["#A879FF", "#7A46E8"],
	},
	{
		label: "Arts",
		icon: "color-palette",
		color: "#2BB3B3",
		gradient: ["#48CCCB", "#189C9C"],
	},
];

/** Gradient for a category (falls back to the brand gradient). */
export function gradientFor(category: string): readonly [string, string] {
	return (
		CATEGORIES.find((c) => c.label === category)?.gradient ?? BRAND_GRADIENT
	);
}
