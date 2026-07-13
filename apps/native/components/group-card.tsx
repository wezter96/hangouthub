import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { cn, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { Display } from "@/components/display";
import { gradientFor } from "@/constants/theme";
import { formatCount } from "@/lib/format";
import type { GroupItem } from "@/lib/types";

type Props = {
	group: GroupItem;
	className?: string;
};

export function GroupCard({ group, className }: Props) {
	const mutedColor = useThemeColor("muted");
	const [from, to] = gradientFor(group.category);

	return (
		<Link href={{ pathname: "/group/[id]", params: { id: group.id } }} asChild>
			<Pressable
				className={cn(
					"flex-row items-center gap-3.5 rounded-3xl border border-border bg-surface p-3 active:opacity-90",
					className,
				)}
			>
				<LinearGradient
					colors={[from, to]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{
						width: 56,
						height: 56,
						borderRadius: 18,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text style={{ fontSize: 26 }}>{group.emoji}</Text>
				</LinearGradient>

				<View className="flex-1">
					<Display className="text-base text-foreground" numberOfLines={1}>
						{group.name}
					</Display>
					<View className="mt-1 flex-row items-center gap-1.5">
						<Text className="font-semibold text-[11px]" style={{ color: to }}>
							{group.category}
						</Text>
						<Text className="text-muted text-xs">·</Text>
						<Text className="text-muted text-xs">
							{formatCount(group.memberCount)} members
						</Text>
					</View>
				</View>

				<Ionicons name="chevron-forward" size={18} color={mutedColor} />
			</Pressable>
		</Link>
	);
}
