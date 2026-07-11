import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { BRAND } from "@/constants/theme";

export function AuthPanel() {
	const [mode, setMode] = useState<"signIn" | "signUp">("signUp");

	return (
		<View className="rounded-3xl border border-border bg-surface p-4">
			<Text className="font-bold text-foreground text-lg">
				Join the community
			</Text>
			<Text className="mt-1 text-muted text-sm">
				Sign in to RSVP to events and connect with groups near you.
			</Text>

			{/* Segmented toggle */}
			<View className="mt-4 mb-1 flex-row rounded-full bg-background p-1">
				{(["signUp", "signIn"] as const).map((value) => {
					const isActive = mode === value;
					return (
						<Pressable
							key={value}
							onPress={() => setMode(value)}
							className="flex-1 items-center rounded-full py-2 active:opacity-80"
							style={{ backgroundColor: isActive ? BRAND : "transparent" }}
						>
							<Text
								className="font-semibold text-foreground text-sm"
								style={isActive ? { color: "#ffffff" } : undefined}
							>
								{value === "signUp" ? "Sign Up" : "Sign In"}
							</Text>
						</Pressable>
					);
				})}
			</View>

			<View className="mt-3">
				{mode === "signUp" ? <SignUp /> : <SignIn />}
			</View>
		</View>
	);
}
