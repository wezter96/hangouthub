import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";
import { BRAND } from "@/constants/theme";

function BrandTitle() {
	const foreground = useThemeColor("foreground");
	return (
		<View className="flex-row items-center">
			<Text className="font-extrabold text-lg" style={{ color: foreground }}>
				Hangout
			</Text>
			<Text className="font-extrabold text-lg" style={{ color: BRAND }}>
				Hub
			</Text>
		</View>
	);
}

function DrawerLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");

	const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

	return (
		<Drawer
			screenOptions={{
				headerTintColor: themeColorForeground,
				headerStyle: { backgroundColor: themeColorBackground },
				headerTitleStyle: {
					fontWeight: "600",
					color: themeColorForeground,
				},
				headerRight: renderThemeToggle,
				drawerActiveTintColor: BRAND,
				drawerStyle: { backgroundColor: themeColorBackground },
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					headerTitle: () => <BrandTitle />,
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Home
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							name="home-outline"
							size={size}
							color={focused ? color : themeColorForeground}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="(tabs)"
				options={{
					headerTitle: "Explore",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							Explore
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							name="compass-outline"
							size={size}
							color={focused ? color : themeColorForeground}
						/>
					),
					headerRight: () => (
						<Link href="/modal" asChild>
							<Pressable className="mr-4">
								<Ionicons
									name="add-circle-outline"
									size={24}
									color={themeColorForeground}
								/>
							</Pressable>
						</Link>
					),
				}}
			/>
			<Drawer.Screen
				name="todos"
				options={{
					headerTitle: "My Tasks",
					drawerLabel: ({ color, focused }) => (
						<Text style={{ color: focused ? color : themeColorForeground }}>
							My Tasks
						</Text>
					),
					drawerIcon: ({ size, color, focused }) => (
						<Ionicons
							name="checkbox-outline"
							size={size}
							color={focused ? color : themeColorForeground}
						/>
					),
				}}
			/>
		</Drawer>
	);
}

export default DrawerLayout;
