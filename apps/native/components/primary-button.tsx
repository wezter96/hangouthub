import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Spinner } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { BRAND, BRAND_GRADIENT } from "@/constants/theme";

type Props = {
	label: string;
	onPress: () => void;
	loading?: boolean;
	disabled?: boolean;
	icon?: keyof typeof Ionicons.glyphMap;
	variant?: "solid" | "outline";
};

/** The app's primary CTA — a warm gradient (solid) or a brand outline. */
export function PrimaryButton({
	label,
	onPress,
	loading = false,
	disabled = false,
	icon,
	variant = "solid",
}: Props) {
	const content = (
		<View className="flex-row items-center justify-center gap-2">
			{loading ? (
				<Spinner size="sm" color="default" />
			) : (
				<>
					{icon ? (
						<Ionicons
							name={icon}
							size={19}
							color={variant === "solid" ? "#ffffff" : BRAND}
						/>
					) : null}
					<Text
						className="font-bold text-base"
						style={{ color: variant === "solid" ? "#ffffff" : BRAND }}
					>
						{label}
					</Text>
				</>
			)}
		</View>
	);

	if (variant === "outline") {
		return (
			<Pressable
				onPress={onPress}
				disabled={disabled || loading}
				className="items-center justify-center rounded-2xl py-4 active:opacity-80"
				style={{ borderWidth: 1.5, borderColor: BRAND }}
			>
				{content}
			</Pressable>
		);
	}

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || loading}
			className="active:opacity-90"
			style={{
				opacity: disabled ? 0.55 : 1,
				shadowColor: BRAND,
				shadowOpacity: 0.4,
				shadowRadius: 16,
				shadowOffset: { width: 0, height: 8 },
				elevation: 5,
			}}
		>
			<LinearGradient
				colors={[BRAND_GRADIENT[0], BRAND_GRADIENT[1]]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={{ borderRadius: 16, paddingVertical: 16 }}
			>
				{content}
			</LinearGradient>
		</Pressable>
	);
}
