import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Spinner, useThemeColor, useToast } from "heroui-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GroupCard } from "@/components/group-card";
import { BRAND } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { formatCount, formatEventDateTime } from "@/lib/format";
import { orpc, queryClient } from "@/utils/orpc";

export default function EventDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const eventId = Number(id);
	const insets = useSafeAreaInsets();
	const { toast } = useToast();

	const backgroundColor = useThemeColor("background");
	const mutedColor = useThemeColor("muted");

	const { data: session } = authClient.useSession();
	const eventQuery = useQuery(
		orpc.event.getById.queryOptions({ input: { id: eventId } }),
	);

	const rsvpMutation = useMutation(
		orpc.event.toggleRsvp.mutationOptions({
			onSuccess: (result) => {
				toast.show({
					variant: result.attending ? "success" : "default",
					label: result.attending ? "You're going! 🎉" : "RSVP cancelled",
				});
				queryClient.invalidateQueries();
			},
			onError: () => {
				toast.show({ variant: "danger", label: "Something went wrong" });
			},
		}),
	);

	const event = eventQuery.data;

	const handleRsvp = () => {
		if (!session?.user) {
			toast.show({ variant: "default", label: "Sign in from Home to RSVP" });
			return;
		}
		rsvpMutation.mutate({ eventId });
	};

	if (eventQuery.isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Stack.Screen options={{ title: "Event" }} />
				<Spinner size="lg" />
			</View>
		);
	}

	if (!event) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Stack.Screen options={{ title: "Event" }} />
				<Ionicons name="alert-circle-outline" size={40} color={mutedColor} />
				<Text className="mt-3 font-medium text-foreground">
					Event not found
				</Text>
			</View>
		);
	}

	const spotsLeft = Math.max(event.capacity - event.attendeeCount, 0);
	const fillPct = Math.min(
		Math.round((event.attendeeCount / event.capacity) * 100),
		100,
	);
	const isFull = spotsLeft === 0 && !event.isAttending;

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: "Event", headerTransparent: false }} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120 }}
			>
				{/* Cover */}
				<View
					className="h-52 items-center justify-center"
					style={{ backgroundColor: event.color }}
				>
					<Text style={{ fontSize: 88 }}>{event.emoji}</Text>
					<View
						className="absolute bottom-4 left-5 rounded-full px-3 py-1.5"
						style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
					>
						<Text className="font-semibold text-white text-xs">
							{event.category}
						</Text>
					</View>
				</View>

				<View className="px-5 pt-5">
					<Text className="font-extrabold text-2xl text-foreground">
						{event.title}
					</Text>

					{/* Meta */}
					<View className="mt-4 gap-3">
						<View className="flex-row items-center gap-3">
							<View
								className="h-9 w-9 items-center justify-center rounded-xl"
								style={{ backgroundColor: `${event.color}22` }}
							>
								<Ionicons name="calendar" size={18} color={event.color} />
							</View>
							<Text className="font-medium text-foreground text-sm">
								{formatEventDateTime(event.startsAt)}
							</Text>
						</View>

						<View className="flex-row items-center gap-3">
							<View
								className="h-9 w-9 items-center justify-center rounded-xl"
								style={{ backgroundColor: `${event.color}22` }}
							>
								<Ionicons name="location" size={18} color={event.color} />
							</View>
							<View className="flex-1">
								<Text className="font-medium text-foreground text-sm">
									{event.venue}
								</Text>
								<Text className="text-muted text-xs">{event.city}</Text>
							</View>
						</View>
					</View>

					{/* Attendance */}
					<View className="mt-5 rounded-3xl border border-border bg-surface p-4">
						<View className="flex-row items-center justify-between">
							<Text className="font-semibold text-foreground text-sm">
								{formatCount(event.attendeeCount)} going
							</Text>
							<Text className="text-muted text-xs">{spotsLeft} spots left</Text>
						</View>
						<View className="mt-2.5 h-2 overflow-hidden rounded-full bg-background">
							<View
								className="h-full rounded-full"
								style={{ width: `${fillPct}%`, backgroundColor: event.color }}
							/>
						</View>
					</View>

					{/* About */}
					<Text className="mt-6 font-bold text-foreground text-lg">
						About this event
					</Text>
					<Text className="mt-2 text-muted text-sm leading-6">
						{event.description}
					</Text>

					{/* Host */}
					{event.group ? (
						<>
							<Text className="mt-6 font-bold text-foreground text-lg">
								Hosted by
							</Text>
							<View className="mt-2">
								<GroupCard group={event.group} />
							</View>
						</>
					) : null}
				</View>
			</ScrollView>

			{/* Sticky RSVP bar */}
			<View
				className="absolute right-0 bottom-0 left-0 border-border border-t px-5 pt-3"
				style={{ backgroundColor, paddingBottom: insets.bottom + 12 }}
			>
				<Pressable
					onPress={handleRsvp}
					disabled={rsvpMutation.isPending || isFull}
					className="flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-90"
					style={{
						backgroundColor: event.isAttending
							? "transparent"
							: isFull
								? mutedColor
								: BRAND,
						borderWidth: event.isAttending ? 1.5 : 0,
						borderColor: event.isAttending ? BRAND : "transparent",
					}}
				>
					{rsvpMutation.isPending ? (
						<Spinner size="sm" color="default" />
					) : (
						<>
							{event.isAttending ? (
								<Ionicons name="checkmark-circle" size={20} color={BRAND} />
							) : null}
							<Text
								className="font-bold text-base"
								style={{ color: event.isAttending ? BRAND : "#ffffff" }}
							>
								{event.isAttending
									? "You're going"
									: isFull
										? "Event full"
										: "RSVP — I'm going"}
							</Text>
						</>
					)}
				</Pressable>
			</View>
		</View>
	);
}
