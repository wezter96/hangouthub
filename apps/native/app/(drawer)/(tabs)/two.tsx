import { useQuery } from "@tanstack/react-query";
import { Spinner } from "heroui-native";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";
import { GroupCard } from "@/components/group-card";
import { orpc } from "@/utils/orpc";

export default function GroupsScreen() {
	const groups = useQuery(orpc.group.getAll.queryOptions());

	return (
		<Container isScrollable={false}>
			<View className="px-5 pt-3 pb-4">
				<Text className="font-extrabold text-3xl text-foreground">Groups</Text>
				<Text className="mt-1 text-muted text-sm">
					Communities to join and grow with
				</Text>
			</View>

			{groups.isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Spinner size="lg" />
					<Text className="mt-3 text-muted text-sm">Loading groups…</Text>
				</View>
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 20,
						paddingBottom: 24,
						gap: 12,
					}}
				>
					{(groups.data ?? []).map((group) => (
						<GroupCard key={group.id} group={group} />
					))}
				</ScrollView>
			)}
		</Container>
	);
}
