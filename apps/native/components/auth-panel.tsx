import { Ionicons } from "@expo/vector-icons";
import { env } from "@hangouthub/env/native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Display } from "@/components/display";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { BRAND } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";

const SOCIAL_ENABLED = env.EXPO_PUBLIC_ENABLE_SOCIAL === "true";

export function AuthPanel() {
	const [mode, setMode] = useState<"signIn" | "signUp">("signUp");

	const signInWith = (provider: "github" | "google") => {
		authClient.signIn.social({ provider });
	};

	return (
		<View className="rounded-3xl border border-border bg-surface p-4">
			<Display weight="bold" className="text-foreground text-xl">
				Join the community
			</Display>
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

			{SOCIAL_ENABLED ? (
				<View className="mt-4">
					<Text className="mb-3 text-center text-muted text-xs">
						or continue with
					</Text>
					<View className="flex-row gap-3">
						<Pressable
							onPress={() => signInWith("github")}
							className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3 active:opacity-70"
						>
							<Ionicons name="logo-github" size={18} color={BRAND} />
							<Text className="font-semibold text-foreground text-sm">
								GitHub
							</Text>
						</Pressable>
						<Pressable
							onPress={() => signInWith("google")}
							className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3 active:opacity-70"
						>
							<Ionicons name="logo-google" size={18} color={BRAND} />
							<Text className="font-semibold text-foreground text-sm">
								Google
							</Text>
						</Pressable>
					</View>
				</View>
			) : null}
		</View>
	);
}
