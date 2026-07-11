import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Spinner, useThemeColor, useToast } from "heroui-native";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";
import { EventCard } from "@/components/event-card";
import { SectionHeader } from "@/components/section-header";
import { BRAND } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { formatCount } from "@/lib/format";
import { orpc, queryClient } from "@/utils/orpc";

export default function GroupDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const groupId = Number(id);
	const { toast } = useToast();
	const mutedColor = useThemeColor("muted");

	const { data: session } = authClient.useSession();
	const groupQuery = useQuery(
		orpc.group.getById.queryOptions({ input: { id: groupId } }),
	);

	const joinMutation = useMutation(
		orpc.group.toggleMembership.mutationOptions({
			onSuccess: (result) => {
				toast.show({
					variant: result.member ? "success" : "default",
					label: result.member ? "Joined 🎉" : "Left group",
				});
				queryClient.invalidateQueries();
			},
			onError: () =>
				toast.show({ variant: "danger", label: "Something went wrong" }),
		}),
	);

	const group = groupQuery.data;

	const handleJoin = () => {
		if (!session?.user) {
			toast.show({ variant: "default", label: "Sign in from Home to join" });
			return;
		}
		joinMutation.mutate({ groupId });
	};

	if (groupQuery.isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Stack.Screen options={{ title: "Group" }} />
				<Spinner size="lg" />
			</View>
		);
	}

	if (!group) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Stack.Screen options={{ title: "Group" }} />
				<Ionicons name="alert-circle-outline" size={40} color={mutedColor} />
				<Text className="mt-3 font-medium text-foreground">
					Group not found
				</Text>
			</View>
		);
	}

	return (
		<Container>
			<Stack.Screen options={{ title: group.name }} />

			{/* Cover */}
			<View
				className="h-44 items-center justify-center"
				style={{ backgroundColor: group.color }}
			>
				<Text style={{ fontSize: 76 }}>{group.emoji}</Text>
			</View>

			<View className="px-5 pt-5">
				<Text className="font-extrabold text-2xl text-foreground">
					{group.name}
				</Text>

				<View className="mt-2 flex-row items-center gap-2">
					<View
						className="rounded-full px-2.5 py-1"
						style={{ backgroundColor: `${group.color}22` }}
					>
						<Text
							className="font-semibold text-xs"
							style={{ color: group.color }}
						>
							{group.category}
						</Text>
					</View>
					<View className="flex-row items-center gap-1">
						<Ionicons name="people" size={14} color={mutedColor} />
						<Text className="text-muted text-xs">
							{formatCount(group.memberCount)} members
						</Text>
					</View>
					<Text className="text-muted text-xs">·</Text>
					<Text className="text-muted text-xs">{group.city}</Text>
				</View>

				{/* Join / leave */}
				<Pressable
					onPress={handleJoin}
					disabled={joinMutation.isPending}
					className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-90"
					style={{
						backgroundColor: group.isMember ? "transparent" : BRAND,
						borderWidth: group.isMember ? 1.5 : 0,
						borderColor: group.isMember ? BRAND : "transparent",
					}}
				>
					{joinMutation.isPending ? (
						<Spinner size="sm" color="default" />
					) : (
						<>
							<Ionicons
								name={group.isMember ? "checkmark-circle" : "add"}
								size={19}
								color={group.isMember ? BRAND : "#ffffff"}
							/>
							<Text
								className="font-bold text-base"
								style={{ color: group.isMember ? BRAND : "#ffffff" }}
							>
								{group.isMember ? "Joined" : "Join group"}
							</Text>
						</>
					)}
				</Pressable>

				<Text className="mt-6 text-muted text-sm leading-6">
					{group.description}
				</Text>

				<View className="mt-7">
					<SectionHeader title="Upcoming events" />
				</View>
			</View>

			{group.events.length === 0 ? (
				<View className="mx-5 items-center rounded-3xl border border-border bg-surface py-10">
					<Ionicons name="calendar-outline" size={32} color={mutedColor} />
					<Text className="mt-3 font-medium text-foreground">
						No upcoming events
					</Text>
					<Text className="mt-1 text-muted text-xs">Check back soon</Text>
				</View>
			) : (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						gap: 14,
						paddingHorizontal: 20,
						paddingBottom: 8,
					}}
				>
					{group.events.map((event) => (
						<EventCard key={event.id} event={event} className="w-72" />
					))}
				</ScrollView>
			)}

			<View className="h-8" />
		</Container>
	);
}
