import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Input, Spinner, TextField, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { CategoryPills } from "@/components/category-pills";
import { Container } from "@/components/container";
import { EventCard } from "@/components/event-card";
import { orpc } from "@/utils/orpc";

export default function DiscoverScreen() {
	const [category, setCategory] = useState("All");
	const [query, setQuery] = useState("");
	const mutedColor = useThemeColor("muted");
	const events = useQuery(orpc.event.getUpcoming.queryOptions());

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return (events.data ?? []).filter((event) => {
			if (category !== "All" && event.category !== category) return false;
			if (!needle) return true;
			return (
				event.title.toLowerCase().includes(needle) ||
				event.venue.toLowerCase().includes(needle) ||
				event.city.toLowerCase().includes(needle) ||
				event.description.toLowerCase().includes(needle)
			);
		});
	}, [events.data, category, query]);

	return (
		<Container isScrollable={false}>
			<View className="px-5 pt-3 pb-3">
				<Text className="font-extrabold text-3xl text-foreground">
					Discover
				</Text>
				<Text className="mt-1 text-muted text-sm">
					Find events happening near you
				</Text>
			</View>

			{/* Search */}
			<View className="px-5 pb-3">
				<View className="flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3.5">
					<Ionicons name="search" size={18} color={mutedColor} />
					<View className="flex-1">
						<TextField>
							<Input
								value={query}
								onChangeText={setQuery}
								placeholder="Search events, venues, cities…"
								autoCapitalize="none"
								returnKeyType="search"
								style={{
									borderWidth: 0,
									backgroundColor: "transparent",
									paddingHorizontal: 0,
								}}
							/>
						</TextField>
					</View>
				</View>
			</View>

			<View className="pb-4">
				<CategoryPills selected={category} onSelect={setCategory} />
			</View>

			{events.isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Loading events…</Text>
				</View>
			) : filtered.length === 0 ? (
				<View className="mx-5 items-center rounded-3xl border border-border bg-surface py-12">
					<Ionicons name="search-outline" size={36} color={mutedColor} />
					<Text className="mt-3 font-medium text-foreground">
						Nothing here yet
					</Text>
					<Text className="mt-1 text-muted text-xs">
						{query ? "Try a different search" : "Try a different category"}
					</Text>
				</View>
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{
						paddingHorizontal: 20,
						paddingBottom: 24,
						gap: 14,
					}}
				>
					{filtered.map((event) => (
						<EventCard key={event.id} event={event} />
					))}
				</ScrollView>
			)}
		</Container>
	);
}
