import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import {
	Input,
	Spinner,
	TextField,
	useThemeColor,
	useToast,
} from "heroui-native";
import { useState } from "react";
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { GroupCard } from "@/components/group-card";
import { BRAND } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import {
	formatCount,
	formatEventDateTime,
	mapsUrl,
	timeAgo,
} from "@/lib/format";
import { orpc, queryClient } from "@/utils/orpc";

export default function EventDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const eventId = Number(id);
	const insets = useSafeAreaInsets();
	const { toast } = useToast();
	const [commentText, setCommentText] = useState("");

	const backgroundColor = useThemeColor("background");
	const mutedColor = useThemeColor("muted");

	const { data: session } = authClient.useSession();
	const eventQuery = useQuery(
		orpc.event.getById.queryOptions({ input: { id: eventId } }),
	);
	const attendeesQuery = useQuery(
		orpc.event.getAttendees.queryOptions({ input: { eventId } }),
	);
	const commentsQuery = useQuery(
		orpc.comment.list.queryOptions({ input: { eventId } }),
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
			onError: () =>
				toast.show({ variant: "danger", label: "Something went wrong" }),
		}),
	);

	const commentMutation = useMutation(
		orpc.comment.create.mutationOptions({
			onSuccess: () => {
				setCommentText("");
				queryClient.invalidateQueries();
			},
			onError: () =>
				toast.show({ variant: "danger", label: "Could not post comment" }),
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

	const handleComment = () => {
		if (!session?.user) {
			toast.show({ variant: "default", label: "Sign in from Home to comment" });
			return;
		}
		if (!commentText.trim()) return;
		commentMutation.mutate({ eventId, body: commentText.trim() });
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
	const attendees = attendeesQuery.data ?? [];
	const comments = commentsQuery.data ?? [];

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: "Event", headerTransparent: false }} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 130 }}
			>
				{/* Cover */}
				{event.imageUrl ? (
					<View className="h-52">
						<Image
							source={{ uri: event.imageUrl }}
							style={{ width: "100%", height: "100%" }}
						/>
						<View
							className="absolute bottom-4 left-5 rounded-full px-3 py-1.5"
							style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
						>
							<Text className="font-semibold text-white text-xs">
								{event.category}
							</Text>
						</View>
					</View>
				) : (
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
				)}

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
							<Pressable
								onPress={() =>
									Linking.openURL(mapsUrl(event.venue, event.city))
								}
								className="flex-row items-center gap-1 rounded-full border border-border px-3 py-1.5 active:opacity-70"
							>
								<Ionicons name="map-outline" size={14} color={mutedColor} />
								<Text className="font-semibold text-foreground text-xs">
									Map
								</Text>
							</Pressable>
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

					{/* Who's going */}
					{attendees.length > 0 ? (
						<View className="mt-6">
							<Text className="mb-3 font-bold text-foreground text-lg">
								Who's going
							</Text>
							<View className="flex-row items-center">
								{attendees.slice(0, 8).map((person, index) => (
									<View
										key={person.id}
										style={{ marginLeft: index === 0 ? 0 : -10 }}
										className="rounded-full border-2 border-background"
									>
										<Avatar name={person.name} image={person.image} size={38} />
									</View>
								))}
								{attendees.length > 8 ? (
									<Text className="ml-3 text-muted text-sm">
										+{attendees.length - 8} more
									</Text>
								) : null}
							</View>
						</View>
					) : null}

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

					{/* Discussion */}
					<Text className="mt-7 font-bold text-foreground text-lg">
						Discussion{comments.length ? ` · ${comments.length}` : ""}
					</Text>

					<View className="mt-3 flex-row items-center gap-2">
						<View className="flex-1">
							<TextField>
								<Input
									value={commentText}
									onChangeText={setCommentText}
									placeholder="Add a comment…"
									onSubmitEditing={handleComment}
									returnKeyType="send"
								/>
							</TextField>
						</View>
						<Pressable
							onPress={handleComment}
							disabled={commentMutation.isPending || !commentText.trim()}
							className="h-11 w-11 items-center justify-center rounded-2xl active:opacity-80"
							style={{
								backgroundColor: commentText.trim() ? BRAND : mutedColor,
							}}
						>
							{commentMutation.isPending ? (
								<Spinner size="sm" color="default" />
							) : (
								<Ionicons name="send" size={17} color="#ffffff" />
							)}
						</Pressable>
					</View>

					{comments.length === 0 ? (
						<Text className="mt-4 text-muted text-sm">
							Be the first to say something.
						</Text>
					) : (
						<View className="mt-4 gap-4">
							{comments.map((c) => (
								<View key={c.id} className="flex-row gap-3">
									<Avatar name={c.authorName} image={c.authorImage} size={36} />
									<View className="flex-1">
										<View className="flex-row items-center gap-2">
											<Text className="font-semibold text-foreground text-sm">
												{c.authorName}
											</Text>
											<Text className="text-muted text-xs">
												{timeAgo(c.createdAt)}
											</Text>
										</View>
										<Text className="mt-0.5 text-foreground text-sm leading-5">
											{c.body}
										</Text>
									</View>
								</View>
							))}
						</View>
					)}
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
