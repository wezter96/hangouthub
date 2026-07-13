import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "heroui-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { gradientFor } from "@/constants/theme";

type Props = {
	imageUrl?: string | null;
	emoji: string;
	category: string;
	heightClass?: string;
	emojiSize?: number;
	scrim?: boolean;
	children?: ReactNode;
};

/** A premium event/group cover: photo when available, else a category gradient
 *  with a large emoji. An optional dark scrim keeps overlaid text legible. */
export function EventCover({
	imageUrl,
	emoji,
	category,
	heightClass = "h-40",
	emojiSize = 54,
	scrim = true,
	children,
}: Props) {
	const [from, to] = gradientFor(category);

	return (
		<View className={cn("w-full overflow-hidden", heightClass)}>
			{imageUrl ? (
				<Image
					source={imageUrl}
					style={{ width: "100%", height: "100%" }}
					contentFit="cover"
					transition={220}
				/>
			) : (
				<LinearGradient
					colors={[from, to]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
				>
					<Text style={{ fontSize: emojiSize }}>{emoji}</Text>
				</LinearGradient>
			)}

			{scrim ? (
				<LinearGradient
					colors={["transparent", "rgba(12,10,16,0.65)"]}
					pointerEvents="none"
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						bottom: 0,
						height: "75%",
					}}
				/>
			) : null}

			{children}
		</View>
	);
}
