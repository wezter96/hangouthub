import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { cn, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { formatCount, formatDateBadge, formatRelativeDay } from "@/lib/format";
import type { EventListItem } from "@/lib/types";

type Props = {
	event: EventListItem;
	className?: string;
};

export function EventCard({ event, className }: Props) {
	const mutedColor = useThemeColor("muted");
	const badge = formatDateBadge(event.startsAt);
	const spotsLeft = Math.max(event.capacity - event.attendeeCount, 0);
	const isFull = spotsLeft === 0;

	return (
		<Link href={{ pathname: "/event/[id]", params: { id: event.id } }} asChild>
			<Pressable
				className={cn(
					"overflow-hidden rounded-3xl border border-border bg-surface active:opacity-90",
					className,
				)}
			>
				{/* Cover */}
				<View
					className="h-28 items-center justify-center"
					style={{ backgroundColor: event.color }}
				>
					<Text style={{ fontSize: 52 }}>{event.emoji}</Text>
					<View
						className="absolute top-3 left-3 rounded-full px-2.5 py-1"
						style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
					>
						<Text className="font-semibold text-white text-xs">
							{event.category}
						</Text>
					</View>
					<View
						className="absolute top-3 right-3 items-center rounded-xl px-2.5 py-1"
						style={{ backgroundColor: "rgba(255,255,255,0.96)" }}
					>
						<Text
							className="font-bold text-[10px] tracking-wider"
							style={{ color: event.color }}
						>
							{badge.month}
						</Text>
						<Text
							className="font-extrabold text-sm leading-4"
							style={{ color: "#111827" }}
						>
							{badge.day}
						</Text>
					</View>
				</View>

				{/* Body */}
				<View className="p-4">
					<View className="mb-2 flex-row items-center gap-1.5">
						<Ionicons name="time-outline" size={13} color={mutedColor} />
						<Text className="font-medium text-muted text-xs">
							{formatRelativeDay(event.startsAt)}
						</Text>
					</View>

					<Text
						className="font-semibold text-base text-foreground"
						numberOfLines={2}
					>
						{event.title}
					</Text>

					<View className="mt-2 flex-row items-center gap-1.5">
						<Ionicons name="location-outline" size={14} color={mutedColor} />
						<Text className="flex-1 text-muted text-xs" numberOfLines={1}>
							{event.venue}
						</Text>
					</View>

					<View className="mt-3 flex-row items-center justify-between">
						<View className="flex-row items-center gap-1.5">
							<Ionicons name="people" size={15} color={mutedColor} />
							<Text className="font-medium text-muted text-xs">
								{formatCount(event.attendeeCount)} going
							</Text>
						</View>
						<Text
							className={cn(
								"font-semibold text-xs",
								isFull ? "text-danger" : "text-foreground",
							)}
						>
							{isFull ? "Full" : `${spotsLeft} spots left`}
						</Text>
					</View>
				</View>
			</Pressable>
		</Link>
	);
}
