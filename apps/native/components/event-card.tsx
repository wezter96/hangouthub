import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { cn, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { Display } from "@/components/display";
import { EventCover } from "@/components/event-cover";
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
					"overflow-hidden rounded-[26px] border border-border bg-surface active:opacity-95",
					className,
				)}
				style={{
					shadowColor: "#1c1a22",
					shadowOpacity: 0.1,
					shadowRadius: 20,
					shadowOffset: { width: 0, height: 10 },
					elevation: 4,
				}}
			>
				<EventCover
					imageUrl={event.imageUrl}
					emoji={event.emoji}
					category={event.category}
					heightClass="h-44"
				>
					{/* Category chip (glass) */}
					<View
						className="absolute top-3.5 left-3.5 rounded-full px-3 py-1.5"
						style={{ backgroundColor: "rgba(20,17,24,0.42)" }}
					>
						<Text className="font-semibold text-[11px] text-white tracking-wide">
							{event.category}
						</Text>
					</View>

					{/* Date badge */}
					<View className="absolute top-3.5 right-3.5 items-center rounded-2xl bg-white px-3 py-1.5">
						<Text
							className="font-bold text-[10px] tracking-widest"
							style={{ color: "#EC4863" }}
						>
							{badge.month}
						</Text>
						<Text
							className="font-extrabold text-lg leading-5"
							style={{ color: "#1c1a22" }}
						>
							{badge.day}
						</Text>
					</View>

					{/* Relative day, over the scrim */}
					<View className="absolute bottom-3 left-4 flex-row items-center gap-1.5">
						<Ionicons
							name="time-outline"
							size={13}
							color="rgba(255,255,255,0.9)"
						/>
						<Text className="font-semibold text-white text-xs">
							{formatRelativeDay(event.startsAt)}
						</Text>
					</View>
				</EventCover>

				{/* Body */}
				<View className="p-4">
					<Display
						className="text-foreground text-lg leading-6"
						numberOfLines={2}
					>
						{event.title}
					</Display>

					<View className="mt-2 flex-row items-center gap-1.5">
						<Ionicons name="location-outline" size={14} color={mutedColor} />
						<Text className="flex-1 text-muted text-xs" numberOfLines={1}>
							{event.venue}
						</Text>
					</View>

					<View className="mt-3.5 flex-row items-center justify-between">
						<View className="flex-row items-center gap-1.5">
							<Ionicons name="people" size={15} color={mutedColor} />
							<Text className="font-medium text-muted text-xs">
								{formatCount(event.attendeeCount)} going
							</Text>
						</View>
						<View
							className="rounded-full px-2.5 py-1"
							style={{
								backgroundColor: isFull
									? "rgba(229,72,77,0.12)"
									: "rgba(236,72,99,0.1)",
							}}
						>
							<Text
								className="font-semibold text-[11px]"
								style={{ color: isFull ? "#E5484D" : "#EC4863" }}
							>
								{isFull ? "Sold out" : `${spotsLeft} spots left`}
							</Text>
						</View>
					</View>
				</View>
			</Pressable>
		</Link>
	);
}
