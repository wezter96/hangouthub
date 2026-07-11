import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/** HangoutHub brand color — a warm, energetic coral used for primary actions. */
export const BRAND = "#F1435E";
export const BRAND_DARK = "#D62F4A";

export type Category = {
	label: string;
	icon: IoniconName;
	color: string;
};

/** Discovery categories. "All" is the default, unfiltered view. */
export const CATEGORIES: Category[] = [
	{ label: "All", icon: "sparkles", color: BRAND },
	{ label: "Tech", icon: "hardware-chip", color: "#2563EB" },
	{ label: "Outdoors", icon: "leaf", color: "#16A34A" },
	{ label: "Fitness", icon: "barbell", color: "#EA580C" },
	{ label: "Food", icon: "restaurant", color: "#DB2777" },
	{ label: "Social", icon: "game-controller", color: "#9333EA" },
	{ label: "Arts", icon: "color-palette", color: "#0891B2" },
];
