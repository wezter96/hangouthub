import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { Pressable, ScrollView, Text } from "react-native";

import { CATEGORIES } from "@/constants/theme";

type Props = {
	selected: string;
	onSelect: (category: string) => void;
};

export function CategoryPills({ selected, onSelect }: Props) {
	const foreground = useThemeColor("foreground");
	const muted = useThemeColor("muted");

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
		>
			{CATEGORIES.map((category) => {
				const isActive = selected === category.label;
				return (
					<Pressable
						key={category.label}
						onPress={() => onSelect(category.label)}
						className="flex-row items-center gap-1.5 rounded-full border px-4 py-2 active:opacity-70"
						style={{
							backgroundColor: isActive ? category.color : "transparent",
							borderColor: isActive ? category.color : `${muted}55`,
						}}
					>
						<Ionicons
							name={category.icon}
							size={15}
							color={isActive ? "#ffffff" : category.color}
						/>
						<Text
							className="font-semibold text-sm"
							style={{ color: isActive ? "#ffffff" : foreground }}
						>
							{category.label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}
