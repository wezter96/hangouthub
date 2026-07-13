import { Text, View } from "react-native";

import { Avatar } from "@/components/avatar";
import type { EventAttendee } from "@/lib/types";

type Props = {
	people: EventAttendee[];
	max?: number;
	size?: number;
};

/** Overlapping avatars with a "+N" overflow chip. */
export function AvatarStack({ people, max = 6, size = 40 }: Props) {
	const shown = people.slice(0, max);
	const extra = people.length - shown.length;

	return (
		<View className="flex-row items-center">
			{shown.map((person, index) => (
				<View
					key={person.id}
					style={{ marginLeft: index === 0 ? 0 : -12 }}
					className="rounded-full border-2 border-background"
				>
					<Avatar name={person.name} image={person.image} size={size} />
				</View>
			))}
			{extra > 0 ? (
				<View
					style={{
						marginLeft: -12,
						width: size,
						height: size,
						borderRadius: size / 2,
					}}
					className="items-center justify-center border-2 border-background bg-surface-secondary"
				>
					<Text className="font-bold text-[11px] text-foreground">
						+{extra}
					</Text>
				</View>
			) : null}
		</View>
	);
}
