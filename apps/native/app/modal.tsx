import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
	Button,
	Input,
	Label,
	Spinner,
	TextField,
	useThemeColor,
	useToast,
} from "heroui-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";
import { BRAND, CATEGORIES } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CREATE_CATEGORIES = CATEGORIES.filter((c) => c.label !== "All");
const HOURS = [8, 10, 12, 14, 17, 18, 19, 20];

function dayOptions() {
	const opts: { offset: number; label: string; sub: string }[] = [];
	for (let i = 0; i < 14; i++) {
		const d = new Date();
		d.setDate(d.getDate() + i);
		const label =
			i === 0 ? "Today" : i === 1 ? "Tomorrow" : WEEKDAYS[d.getDay()];
		opts.push({ offset: i, label, sub: `${d.getMonth() + 1}/${d.getDate()}` });
	}
	return opts;
}

function hourLabel(h: number) {
	const period = h >= 12 ? "PM" : "AM";
	const hh = h % 12 || 12;
	return `${hh} ${period}`;
}

export default function CreateEventScreen() {
	const { toast } = useToast();
	const mutedColor = useThemeColor("muted");
	const { data: session } = authClient.useSession();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState(CREATE_CATEGORIES[0].label);
	const [venue, setVenue] = useState("");
	const [city, setCity] = useState("San Francisco, CA");
	const [dayOffset, setDayOffset] = useState(1);
	const [hour, setHour] = useState(18);
	const [capacity, setCapacity] = useState("30");
	const [groupId, setGroupId] = useState<number | null>(null);

	const myGroups = useQuery({
		...orpc.group.getMine.queryOptions(),
		enabled: !!session?.user,
	});

	const days = useMemo(dayOptions, []);

	const createMutation = useMutation(
		orpc.event.create.mutationOptions({
			onSuccess: (created) => {
				toast.show({ variant: "success", label: "Event created 🎉" });
				queryClient.invalidateQueries();
				router.replace({ pathname: "/event/[id]", params: { id: created.id } });
			},
			onError: (err) => {
				toast.show({
					variant: "danger",
					label: err.message || "Could not create event",
				});
			},
		}),
	);

	const capacityNum = Number.parseInt(capacity, 10);
	const isValid =
		title.trim().length >= 3 &&
		description.trim().length >= 10 &&
		venue.trim().length >= 2 &&
		city.trim().length >= 2 &&
		Number.isFinite(capacityNum) &&
		capacityNum >= 2;

	const handleSubmit = () => {
		if (!session?.user) {
			toast.show({
				variant: "default",
				label: "Sign in from Home to host an event",
			});
			return;
		}
		if (!isValid) {
			toast.show({ variant: "danger", label: "Please fill in all fields" });
			return;
		}
		const startsAt = new Date();
		startsAt.setDate(startsAt.getDate() + dayOffset);
		startsAt.setHours(hour, 0, 0, 0);

		createMutation.mutate({
			title: title.trim(),
			description: description.trim(),
			category,
			venue: venue.trim(),
			city: city.trim(),
			startsAt,
			capacity: capacityNum,
			groupId,
		});
	};

	if (!session?.user) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center p-6">
					<View
						className="h-16 w-16 items-center justify-center rounded-2xl"
						style={{ backgroundColor: BRAND }}
					>
						<Ionicons name="lock-closed" size={28} color="#ffffff" />
					</View>
					<Text className="mt-4 font-bold text-foreground text-xl">
						Sign in to host
					</Text>
					<Text className="mt-2 max-w-xs text-center text-muted text-sm">
						You need an account to create an event. Sign in from the Home tab
						first.
					</Text>
					<Button
						onPress={() => router.back()}
						className="mt-6 w-full max-w-xs"
					>
						<Button.Label>Close</Button.Label>
					</Button>
				</View>
			</Container>
		);
	}

	return (
		<Container isScrollable={false}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 18 }}
			>
				<Text className="font-extrabold text-2xl text-foreground">
					Host a hangout
				</Text>

				<TextField>
					<Label>Title</Label>
					<Input
						value={title}
						onChangeText={setTitle}
						placeholder="e.g. Sunset Rooftop Mixer"
					/>
				</TextField>

				<TextField>
					<Label>Description</Label>
					<Input
						value={description}
						onChangeText={setDescription}
						placeholder="What's the plan? Who should come?"
						multiline
						numberOfLines={4}
						style={{ minHeight: 96, textAlignVertical: "top" }}
					/>
				</TextField>

				{/* Category */}
				<View>
					<Text className="mb-2 font-medium text-foreground text-sm">
						Category
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{CREATE_CATEGORIES.map((item) => {
							const active = category === item.label;
							return (
								<Pressable
									key={item.label}
									onPress={() => setCategory(item.label)}
									className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 active:opacity-70"
									style={{
										backgroundColor: active ? item.color : "transparent",
										borderColor: active ? item.color : `${mutedColor}55`,
									}}
								>
									<Ionicons
										name={item.icon}
										size={14}
										color={active ? "#ffffff" : item.color}
									/>
									<Text
										className="font-semibold text-foreground text-sm"
										style={active ? { color: "#ffffff" } : undefined}
									>
										{item.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<TextField>
					<Label>Venue</Label>
					<Input
						value={venue}
						onChangeText={setVenue}
						placeholder="e.g. SoMa Rooftop"
					/>
				</TextField>

				<TextField>
					<Label>City</Label>
					<Input value={city} onChangeText={setCity} placeholder="City" />
				</TextField>

				{/* Day */}
				<View>
					<Text className="mb-2 font-medium text-foreground text-sm">Day</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8 }}
					>
						{days.map((d) => {
							const active = dayOffset === d.offset;
							return (
								<Pressable
									key={d.offset}
									onPress={() => setDayOffset(d.offset)}
									className="items-center rounded-2xl border px-3.5 py-2 active:opacity-70"
									style={{
										backgroundColor: active ? BRAND : "transparent",
										borderColor: active ? BRAND : `${mutedColor}55`,
									}}
								>
									<Text
										className="font-bold text-foreground text-xs"
										style={active ? { color: "#ffffff" } : undefined}
									>
										{d.label}
									</Text>
									<Text
										className="text-[11px] text-muted"
										style={
											active ? { color: "rgba(255,255,255,0.85)" } : undefined
										}
									>
										{d.sub}
									</Text>
								</Pressable>
							);
						})}
					</ScrollView>
				</View>

				{/* Time */}
				<View>
					<Text className="mb-2 font-medium text-foreground text-sm">
						Start time
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{HOURS.map((h) => {
							const active = hour === h;
							return (
								<Pressable
									key={h}
									onPress={() => setHour(h)}
									className="rounded-full border px-3.5 py-2 active:opacity-70"
									style={{
										backgroundColor: active ? BRAND : "transparent",
										borderColor: active ? BRAND : `${mutedColor}55`,
									}}
								>
									<Text
										className="font-semibold text-foreground text-sm"
										style={active ? { color: "#ffffff" } : undefined}
									>
										{hourLabel(h)}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<TextField>
					<Label>Capacity</Label>
					<Input
						value={capacity}
						onChangeText={(t) => setCapacity(t.replace(/[^0-9]/g, ""))}
						placeholder="30"
						keyboardType="number-pad"
					/>
				</TextField>

				{/* Host group (optional) */}
				{(myGroups.data ?? []).length > 0 ? (
					<View>
						<Text className="mb-2 font-medium text-foreground text-sm">
							Host under a group
						</Text>
						<View className="flex-row flex-wrap gap-2">
							<Pressable
								onPress={() => setGroupId(null)}
								className="rounded-full border px-3.5 py-2 active:opacity-70"
								style={{
									backgroundColor: groupId === null ? BRAND : "transparent",
									borderColor: groupId === null ? BRAND : `${mutedColor}55`,
								}}
							>
								<Text
									className="font-semibold text-foreground text-sm"
									style={groupId === null ? { color: "#ffffff" } : undefined}
								>
									None
								</Text>
							</Pressable>
							{(myGroups.data ?? []).map((g) => {
								const active = groupId === g.id;
								return (
									<Pressable
										key={g.id}
										onPress={() => setGroupId(g.id)}
										className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 active:opacity-70"
										style={{
											backgroundColor: active ? BRAND : "transparent",
											borderColor: active ? BRAND : `${mutedColor}55`,
										}}
									>
										<Text style={{ fontSize: 13 }}>{g.emoji}</Text>
										<Text
											className="font-semibold text-foreground text-sm"
											style={active ? { color: "#ffffff" } : undefined}
										>
											{g.name}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
				) : null}

				<Pressable
					onPress={handleSubmit}
					disabled={createMutation.isPending}
					className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-90"
					style={{ backgroundColor: isValid ? BRAND : mutedColor }}
				>
					{createMutation.isPending ? (
						<Spinner size="sm" color="default" />
					) : (
						<Text className="font-bold text-base text-white">
							Publish event
						</Text>
					)}
				</Pressable>
			</ScrollView>
		</Container>
	);
}
