import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Spinner, useThemeColor, useToast } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { Display } from "@/components/display";
import { EventCarousel } from "@/components/event-carousel";
import { EventCover } from "@/components/event-cover";
import { PrimaryButton } from "@/components/primary-button";
import { SectionHeader } from "@/components/section-header";
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

			<EventCover
				emoji={group.emoji}
				category={group.category}
				heightClass="h-56"
				emojiSize={92}
			>
				<View className="absolute right-0 bottom-0 left-0 px-5 pb-4">
					<Display weight="bold" className="text-2xl text-white leading-8">
						{group.name}
					</Display>
					<View className="mt-1.5 flex-row items-center gap-2">
						<Ionicons name="people" size={14} color="rgba(255,255,255,0.9)" />
						<Text className="font-medium text-white text-xs">
							{formatCount(group.memberCount)} members
						</Text>
						<Text className="text-white/60 text-xs">·</Text>
						<Text className="font-medium text-white text-xs">{group.city}</Text>
					</View>
				</View>
			</EventCover>

			<View className="px-5 pt-5">
				<PrimaryButton
					label={group.isMember ? "Joined" : "Join group"}
					icon={group.isMember ? "checkmark-circle" : "add"}
					variant={group.isMember ? "outline" : "solid"}
					loading={joinMutation.isPending}
					onPress={handleJoin}
				/>

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
				<EventCarousel events={group.events} />
			)}

			<View className="h-8" />
		</Container>
	);
}
