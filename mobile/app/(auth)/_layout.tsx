import { useThemeStore } from "@/store/useThemeStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
	const { isDark } = useThemeStore();
	return (
		<>
			<StatusBar style={isDark ? "light" : "dark"} />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="login" options={{ animation: "fade" }} />
				<Stack.Screen name="otp" options={{ animation: "fade" }} />
				<Stack.Screen name="complete-profile" options={{ animation: "fade" }} />
				<Stack.Screen name="forgot-password" options={{ animation: "fade" }} />
				<Stack.Screen name="status" options={{ animation: "fade" }} />
			</Stack>
		</>
	);
}
