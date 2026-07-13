import { ScrollView } from "react-native";

import { EventCard } from "@/components/event-card";
import type { EventListItem } from "@/lib/types";

export function EventCarousel({ events }: { events: EventListItem[] }) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ gap: 16, paddingHorizontal: 20 }}
		>
			{events.map((event) => (
				<EventCard key={event.id} event={event} className="w-72" />
			))}
		</ScrollView>
	);
}
