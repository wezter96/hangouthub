import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Display } from "@/components/display";
import { BRAND } from "@/constants/theme";

type Props = {
	title: string;
	actionLabel?: string;
	onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
	return (
		<View className="mb-3.5 flex-row items-end justify-between">
			<Display weight="bold" className="text-[22px] text-foreground leading-7">
				{title}
			</Display>
			{actionLabel ? (
				<Pressable
					onPress={onAction}
					className="flex-row items-center gap-0.5 active:opacity-60"
				>
					<Text className="font-semibold text-sm" style={{ color: BRAND }}>
						{actionLabel}
					</Text>
					<Ionicons name="chevron-forward" size={14} color={BRAND} />
				</Pressable>
			) : null}
		</View>
	);
}
