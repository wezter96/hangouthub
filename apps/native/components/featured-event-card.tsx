import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Display } from "@/components/display";
import { EventCover } from "@/components/event-cover";
import { formatCount, formatRelativeDay } from "@/lib/format";
import type { EventListItem } from "@/lib/types";

export function FeaturedEventCard({ event }: { event: EventListItem }) {
	return (
		<Link href={{ pathname: "/event/[id]", params: { id: event.id } }} asChild>
			<View
				className="overflow-hidden rounded-[30px] active:opacity-95"
				style={{
					shadowColor: "#1c1a22",
					shadowOpacity: 0.18,
					shadowRadius: 28,
					shadowOffset: { width: 0, height: 14 },
					elevation: 8,
				}}
			>
				<EventCover
					imageUrl={event.imageUrl}
					emoji={event.emoji}
					category={event.category}
					heightClass="h-72"
					emojiSize={104}
				>
					{/* Featured pill */}
					<View
						className="absolute top-4 left-4 flex-row items-center gap-1 rounded-full px-3 py-1.5"
						style={{ backgroundColor: "rgba(20,17,24,0.42)" }}
					>
						<Ionicons name="star" size={12} color="#FFD27A" />
						<Text className="font-semibold text-[11px] text-white tracking-wide">
							Featured
						</Text>
					</View>

					{/* Category */}
					<View
						className="absolute top-4 right-4 rounded-full px-3 py-1.5"
						style={{ backgroundColor: "rgba(20,17,24,0.42)" }}
					>
						<Text className="font-semibold text-[11px] text-white tracking-wide">
							{event.category}
						</Text>
					</View>

					{/* Overlaid title + meta */}
					<View className="absolute right-0 bottom-0 left-0 p-5">
						<Display
							weight="bold"
							className="text-2xl text-white leading-7"
							numberOfLines={2}
						>
							{event.title}
						</Display>
						<View className="mt-2 flex-row items-center gap-2">
							<Ionicons
								name="time-outline"
								size={13}
								color="rgba(255,255,255,0.9)"
							/>
							<Text className="font-medium text-white text-xs">
								{formatRelativeDay(event.startsAt)}
							</Text>
							<Text className="text-white/60 text-xs">·</Text>
							<Ionicons name="people" size={14} color="rgba(255,255,255,0.9)" />
							<Text className="font-medium text-white text-xs">
								{formatCount(event.attendeeCount)} going
							</Text>
						</View>
					</View>
				</EventCover>
			</View>
		</Link>
	);
}
