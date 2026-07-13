import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { CategoryPills } from "@/components/category-pills";
import { Container } from "@/components/container";
import { Display } from "@/components/display";
import { EventCarousel } from "@/components/event-carousel";
import { FeaturedEventCard } from "@/components/featured-event-card";
import { GroupCard } from "@/components/group-card";
import { SectionHeader } from "@/components/section-header";
import { BRAND } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { greeting } from "@/lib/format";
import { orpc, queryClient } from "@/utils/orpc";

export default function HomeScreen() {
	const [category, setCategory] = useState("All");
	const mutedColor = useThemeColor("muted");

	const { data: session } = authClient.useSession();
	const healthCheck = useQuery(orpc.healthCheck.queryOptions());
	const events = useQuery(
		orpc.event.getUpcoming.queryOptions({ input: { limit: 12 } }),
	);
	const groups = useQuery(orpc.group.getAll.queryOptions());

	const isConnected = healthCheck.data === "OK";
	const firstName = session?.user?.name?.split(" ")[0];

	const filteredEvents = useMemo(() => {
		const all = events.data ?? [];
		return category === "All"
			? all
			: all.filter((event) => event.category === category);
	}, [events.data, category]);

	const featured = filteredEvents[0];
	const rest = filteredEvents.slice(1);

	return (
		<Container scrollViewProps={{ showsVerticalScrollIndicator: false }}>
			{/* Header */}
			<View className="px-5 pt-2 pb-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-1">
						<Text className="text-muted text-sm">
							{greeting()}
							{firstName ? "," : ""}
						</Text>
						<Display
							weight="bold"
							className="text-[26px] text-foreground leading-8"
						>
							{firstName ?? "Welcome"}
						</Display>
					</View>
					<View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
						<View
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: isConnected ? "#2E9E6B" : mutedColor }}
						/>
						<Text className="font-medium text-muted text-xs">
							{isConnected ? "Live" : "Offline"}
						</Text>
					</View>
				</View>

				<View className="mt-1.5 flex-row items-center gap-1">
					<Ionicons name="location" size={13} color={BRAND} />
					<Text className="font-medium text-muted text-xs">
						San Francisco, CA
					</Text>
				</View>
			</View>

			{/* Featured */}
			{featured ? (
				<View className="px-5">
					<FeaturedEventCard event={featured} />
				</View>
			) : null}

			{/* Interests */}
			<View className="mt-7">
				<Display
					weight="bold"
					className="mb-3.5 px-5 text-[22px] text-foreground leading-7"
				>
					Browse by interest
				</Display>
				<CategoryPills selected={category} onSelect={setCategory} />
			</View>

			{/* Upcoming events */}
			<View className="mt-8 px-5">
				<SectionHeader title="Upcoming near you" />
			</View>
			{rest.length === 0 ? (
				<View className="mx-5 items-center rounded-3xl border border-border bg-surface py-10">
					<Ionicons name="calendar-outline" size={34} color={mutedColor} />
					<Text className="mt-3 font-medium text-foreground">
						Nothing else in this category
					</Text>
					<Text className="mt-1 text-muted text-xs">
						Try another interest above
					</Text>
				</View>
			) : (
				<EventCarousel events={rest} />
			)}

			{/* Popular groups */}
			<View className="mt-9 px-5">
				<SectionHeader title="Popular groups" />
				<View className="gap-3">
					{(groups.data ?? []).slice(0, 4).map((group) => (
						<GroupCard key={group.id} group={group} />
					))}
				</View>
			</View>

			{/* Auth / account */}
			<View className="mt-8 px-5 pb-10">
				{session?.user ? (
					<View className="rounded-3xl border border-border bg-surface p-4">
						<View className="flex-row items-center gap-3">
							<View
								className="h-11 w-11 items-center justify-center rounded-full"
								style={{ backgroundColor: BRAND }}
							>
								<Text className="font-bold text-base text-white">
									{session.user.name?.charAt(0).toUpperCase() ?? "?"}
								</Text>
							</View>
							<View className="flex-1">
								<Text className="font-semibold text-foreground">
									{session.user.name}
								</Text>
								<Text className="text-muted text-xs">{session.user.email}</Text>
							</View>
							<Pressable
								onPress={() => {
									authClient.signOut();
									queryClient.invalidateQueries();
								}}
								className="rounded-full border border-border px-4 py-2 active:opacity-70"
							>
								<Text className="font-semibold text-danger text-sm">
									Sign out
								</Text>
							</Pressable>
						</View>
					</View>
				) : (
					<AuthPanel />
				)}
			</View>
		</Container>
	);
}
