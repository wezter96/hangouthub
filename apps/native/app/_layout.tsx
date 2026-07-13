import "@/global.css";
import {
	Fraunces_500Medium,
	Fraunces_600SemiBold,
	Fraunces_700Bold,
	useFonts,
} from "@expo-google-fonts/fraunces";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { HeroUINativeProvider, useThemeColor } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { FONT } from "@/constants/theme";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { queryClient } from "@/utils/orpc";

export const unstable_settings = {
	initialRouteName: "(drawer)",
};

function StackLayout() {
	const foreground = useThemeColor("foreground");
	const background = useThemeColor("background");

	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: background },
				headerTintColor: foreground,
				headerTitleStyle: {
					color: foreground,
					fontFamily: FONT.display,
					fontSize: 18,
				},
				headerShadowVisible: false,
				contentStyle: { backgroundColor: background },
			}}
		>
			<Stack.Screen name="(drawer)" options={{ headerShown: false }} />
			<Stack.Screen name="event/[id]" options={{ title: "Event" }} />
			<Stack.Screen name="group/[id]" options={{ title: "Group" }} />
			<Stack.Screen
				name="modal"
				options={{ title: "New event", presentation: "modal" }}
			/>
		</Stack>
	);
}

export default function Layout() {
	const [fontsLoaded] = useFonts({
		Fraunces_500Medium,
		Fraunces_600SemiBold,
		Fraunces_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider>
							<StackLayout />
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
