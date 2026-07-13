import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { Display } from "@/components/display";
import { EventCarousel } from "@/components/event-carousel";
import { GroupCard } from "@/components/group-card";
import { SectionHeader } from "@/components/section-header";
import { BRAND, BRAND_GRADIENT } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import type { EventListItem } from "@/lib/types";
import { orpc, queryClient } from "@/utils/orpc";

function EventRow({
	events,
	emptyLabel,
}: {
	events: EventListItem[];
	emptyLabel: string;
}) {
	const mutedColor = useThemeColor("muted");
	if (events.length === 0) {
		return (
			<View className="mx-5 items-center rounded-3xl border border-border bg-surface py-8">
				<Ionicons name="calendar-outline" size={28} color={mutedColor} />
				<Text className="mt-2 text-muted text-xs">{emptyLabel}</Text>
			</View>
		);
	}
	return <EventCarousel events={events} />;
}

export default function ProfileScreen() {
	const { data: session } = authClient.useSession();
	const mutedColor = useThemeColor("muted");

	const going = useQuery({
		...orpc.event.getMine.queryOptions(),
		enabled: !!session?.user,
	});
	const hosting = useQuery({
		...orpc.event.getHosting.queryOptions(),
		enabled: !!session?.user,
	});
	const myGroups = useQuery({
		...orpc.group.getMine.queryOptions(),
		enabled: !!session?.user,
	});

	if (!session?.user) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-6">
					<View
						className="h-16 w-16 items-center justify-center rounded-2xl"
						style={{ backgroundColor: BRAND }}
					>
						<Ionicons name="person" size={28} color="#ffffff" />
					</View>
					<Display weight="bold" className="mt-4 text-foreground text-xl">
						You're not signed in
					</Display>
					<Text className="mt-2 max-w-xs text-center text-muted text-sm">
						Sign in from the Home tab to see your events and groups.
					</Text>
					<Link href="/(drawer)" asChild>
						<Pressable
							className="mt-6 rounded-2xl px-6 py-3.5"
							style={{ backgroundColor: BRAND }}
						>
							<Text className="font-bold text-white">Go to Home</Text>
						</Pressable>
					</Link>
				</View>
			</Container>
		);
	}

	return (
		<Container scrollViewProps={{ showsVerticalScrollIndicator: false }}>
			{/* Banner + profile */}
			<View className="items-center">
				<LinearGradient
					colors={[BRAND_GRADIENT[0], BRAND_GRADIENT[1]]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={{ height: 108, width: "100%", position: "absolute", top: 0 }}
				/>
				<View className="mt-14 items-center px-5">
					<View className="rounded-full border-4 border-background">
						<View
							className="h-20 w-20 items-center justify-center rounded-full"
							style={{ backgroundColor: BRAND }}
						>
							<Text className="font-bold text-2xl text-white">
								{session.user.name?.charAt(0).toUpperCase() ?? "?"}
							</Text>
						</View>
					</View>
					<Display weight="bold" className="mt-3 text-2xl text-foreground">
						{session.user.name}
					</Display>
					<Text className="text-muted text-sm">{session.user.email}</Text>

					<Pressable
						onPress={() => {
							authClient.signOut();
							queryClient.invalidateQueries();
						}}
						className="mt-4 rounded-full border border-border px-5 py-2 active:opacity-70"
					>
						<Text className="font-semibold text-danger text-sm">Sign out</Text>
					</Pressable>
				</View>
			</View>

			{/* Going */}
			<View className="mt-8 px-5">
				<SectionHeader title="Going" />
			</View>
			<EventRow
				events={going.data ?? []}
				emptyLabel="No RSVPs yet — find an event to join"
			/>

			{/* Hosting */}
			<View className="mt-8 px-5">
				<SectionHeader title="Hosting" />
			</View>
			<EventRow
				events={hosting.data ?? []}
				emptyLabel="You haven't hosted anything yet"
			/>

			{/* Groups */}
			<View className="mt-8 px-5 pb-10">
				<SectionHeader title="Your groups" />
				{(myGroups.data ?? []).length === 0 ? (
					<View className="items-center rounded-3xl border border-border bg-surface py-8">
						<Ionicons name="people-outline" size={28} color={mutedColor} />
						<Text className="mt-2 text-muted text-xs">
							Join a group to see it here
						</Text>
					</View>
				) : (
					<View className="gap-3">
						{(myGroups.data ?? []).map((group) => (
							<GroupCard key={group.id} group={group} />
						))}
					</View>
				)}
			</View>
		</Container>
	);
}
