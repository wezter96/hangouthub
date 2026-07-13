import { Text, type TextProps } from "react-native";

import { FONT } from "@/constants/theme";

type Props = TextProps & {
	className?: string;
	weight?: "medium" | "semibold" | "bold";
};

/** Editorial serif text (Fraunces) for headlines and titles. */
export function Display({
	className,
	weight = "semibold",
	style,
	...props
}: Props) {
	const fontFamily =
		weight === "bold"
			? FONT.displayBold
			: weight === "medium"
				? FONT.displayMedium
				: FONT.display;

	return (
		<Text {...props} className={className} style={[{ fontFamily }, style]} />
	);
}
