import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { cn, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { formatCount } from "@/lib/format";
import type { GroupItem } from "@/lib/types";

type Props = {
	group: GroupItem;
	className?: string;
};

export function GroupCard({ group, className }: Props) {
	const mutedColor = useThemeColor("muted");

	return (
		<Link href={{ pathname: "/group/[id]", params: { id: group.id } }} asChild>
			<Pressable
				className={cn(
					"flex-row items-center gap-3 rounded-3xl border border-border bg-surface p-3 active:opacity-80",
					className,
				)}
			>
				<View
					className="h-14 w-14 items-center justify-center rounded-2xl"
					style={{ backgroundColor: `${group.color}22` }}
				>
					<Text style={{ fontSize: 26 }}>{group.emoji}</Text>
				</View>

				<View className="flex-1">
					<Text
						className="font-semibold text-base text-foreground"
						numberOfLines={1}
					>
						{group.name}
					</Text>
					<View className="mt-0.5 flex-row items-center gap-1.5">
						<View
							className="rounded-full px-2 py-0.5"
							style={{ backgroundColor: `${group.color}22` }}
						>
							<Text
								className="font-semibold text-[11px]"
								style={{ color: group.color }}
							>
								{group.category}
							</Text>
						</View>
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
