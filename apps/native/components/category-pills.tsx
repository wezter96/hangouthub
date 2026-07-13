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
	const surface = useThemeColor("surface");
	const border = useThemeColor("border");

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
						className="flex-row items-center gap-1.5 rounded-full px-4 py-2.5 active:opacity-80"
						style={{
							backgroundColor: isActive ? category.color : surface,
							borderWidth: 1,
							borderColor: isActive ? category.color : border,
							shadowColor: category.color,
							shadowOpacity: isActive ? 0.35 : 0,
							shadowRadius: 12,
							shadowOffset: { width: 0, height: 6 },
							elevation: isActive ? 3 : 0,
						}}
					>
						<Ionicons
							name={category.icon}
							size={15}
							color={isActive ? "#ffffff" : category.color}
						/>
						<Text
							className="font-semibold text-[13px]"
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
