import { Image, Text, View } from "react-native";

const COLORS = [
	"#2563EB",
	"#16A34A",
	"#EA580C",
	"#DB2777",
	"#9333EA",
	"#0891B2",
	"#F1435E",
];

function colorFor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++)
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return COLORS[Math.abs(hash) % COLORS.length];
}

type Props = {
	name: string;
	image?: string | null;
	size?: number;
};

export function Avatar({ name, image, size = 40 }: Props) {
	const initial = name?.charAt(0).toUpperCase() || "?";

	if (image) {
		return (
			<Image
				source={{ uri: image }}
				style={{ width: size, height: size, borderRadius: size / 2 }}
			/>
		);
	}

	return (
		<View
			className="items-center justify-center"
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: colorFor(name || "?"),
			}}
		>
			<Text
				style={{ color: "#ffffff", fontWeight: "700", fontSize: size * 0.42 }}
			>
				{initial}
			</Text>
		</View>
	);
}
