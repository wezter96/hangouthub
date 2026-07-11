import { Pressable, Text, View } from "react-native";

type Props = {
	title: string;
	actionLabel?: string;
	onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
	return (
		<View className="mb-3 flex-row items-center justify-between">
			<Text className="font-bold text-foreground text-xl">{title}</Text>
			{actionLabel ? (
				<Pressable onPress={onAction} className="active:opacity-60">
					<Text className="font-semibold text-accent text-sm">
						{actionLabel}
					</Text>
				</Pressable>
			) : null}
		</View>
	);
}
