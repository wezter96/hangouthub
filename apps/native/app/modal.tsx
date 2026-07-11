import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { BRAND } from "@/constants/theme";

function Modal() {
	function handleClose() {
		router.back();
	}

	return (
		<Container>
			<View className="flex-1 items-center justify-center p-6">
				<View
					className="h-16 w-16 items-center justify-center rounded-2xl"
					style={{ backgroundColor: BRAND }}
				>
					<Ionicons name="calendar" size={30} color="#ffffff" />
				</View>
				<Text className="mt-4 font-bold text-foreground text-xl">
					Host a hangout
				</Text>
				<Text className="mt-2 max-w-xs text-center text-muted text-sm">
					Creating your own events is coming soon. Pick a spot, set a time, and
					invite your community — all from here.
				</Text>
				<Button onPress={handleClose} className="mt-6 w-full max-w-xs">
					<Button.Label>Got it</Button.Label>
				</Button>
			</View>
		</Container>
	);
}

export default Modal;
