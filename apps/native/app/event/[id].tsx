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
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { AvatarStack } from "@/components/avatar-stack";
import { Display } from "@/components/display";
import { EventCover } from "@/components/event-cover";
import { GroupCard } from "@/components/group-card";
import { PrimaryButton } from "@/components/primary-button";
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
			<Stack.Screen options={{ title: "Event" }} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 132 }}
			>
				{/* Cover with overlaid title */}
				<EventCover
					imageUrl={event.imageUrl}
					emoji={event.emoji}
					category={event.category}
					heightClass="h-64"
					emojiSize={104}
				>
					<View
						className="absolute top-4 left-5 rounded-full px-3 py-1.5"
						style={{ backgroundColor: "rgba(20,17,24,0.42)" }}
					>
						<Text className="font-semibold text-[11px] text-white tracking-wide">
							{event.category}
						</Text>
					</View>
					<View className="absolute right-0 bottom-0 left-0 px-5 pb-4">
						<Display weight="bold" className="text-2xl text-white leading-8">
							{event.title}
						</Display>
					</View>
				</EventCover>

				<View className="px-5 pt-5">
					{/* Meta */}
					<View className="gap-3">
						<View className="flex-row items-center gap-3">
							<View
								className="h-10 w-10 items-center justify-center rounded-2xl"
								style={{ backgroundColor: `${BRAND}1a` }}
							>
								<Ionicons name="calendar" size={18} color={BRAND} />
							</View>
							<Text className="font-medium text-foreground text-sm">
								{formatEventDateTime(event.startsAt)}
							</Text>
						</View>

						<View className="flex-row items-center gap-3">
							<View
								className="h-10 w-10 items-center justify-center rounded-2xl"
								style={{ backgroundColor: `${BRAND}1a` }}
							>
								<Ionicons name="location" size={18} color={BRAND} />
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
								className="flex-row items-center gap-1 rounded-full border border-border px-3 py-2 active:opacity-70"
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
						<View className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-secondary">
							<View
								className="h-full rounded-full"
								style={{ width: `${fillPct}%`, backgroundColor: BRAND }}
							/>
						</View>
					</View>

					{/* Who's going */}
					{attendees.length > 0 ? (
						<View className="mt-6">
							<Display weight="bold" className="mb-3 text-foreground text-lg">
								Who's going
							</Display>
							<AvatarStack people={attendees} max={8} size={40} />
						</View>
					) : null}

					{/* About */}
					<Display weight="bold" className="mt-7 text-foreground text-lg">
						About this event
					</Display>
					<Text className="mt-2 text-muted text-sm leading-6">
						{event.description}
					</Text>

					{/* Host */}
					{event.group ? (
						<>
							<Display weight="bold" className="mt-7 text-foreground text-lg">
								Hosted by
							</Display>
							<View className="mt-3">
								<GroupCard group={event.group} />
							</View>
						</>
					) : null}

					{/* Discussion */}
					<Display weight="bold" className="mt-7 text-foreground text-lg">
						Discussion{comments.length ? ` · ${comments.length}` : ""}
					</Display>

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
							className="h-12 w-12 items-center justify-center rounded-2xl active:opacity-80"
							style={{
								backgroundColor: commentText.trim() ? BRAND : mutedColor,
							}}
						>
							{commentMutation.isPending ? (
								<Spinner size="sm" color="default" />
							) : (
								<Ionicons name="arrow-up" size={19} color="#ffffff" />
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
									<Avatar name={c.authorName} image={c.authorImage} size={38} />
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
				{event.isAttending ? (
					<PrimaryButton
						label="You're going"
						icon="checkmark-circle"
						variant="outline"
						loading={rsvpMutation.isPending}
						onPress={handleRsvp}
					/>
				) : (
					<PrimaryButton
						label={isFull ? "Event full" : "RSVP — I'm going"}
						loading={rsvpMutation.isPending}
						disabled={isFull}
						onPress={handleRsvp}
					/>
				)}
			</View>
		</View>
	);
}
