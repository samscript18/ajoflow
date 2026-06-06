import { AppProvider } from "@/providers/providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import "./global.css";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeStore } from "@/store/useThemeStore";

export default function RootLayout() {
	const isDark = useThemeStore((state) => state.isDark);

	useFonts({
		Manrope: require("../assets/fonts/Manrope-VariableFont_wght.ttf"),
		...Ionicons.font,
	});

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppProvider>
				<StatusBar style={isDark ? "light" : "dark"} />
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="onboarding" />
					<Stack.Screen name="(auth)" options={{ animation: "fade" }} />
					<Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
				</Stack>
			</AppProvider>
		</GestureHandlerRootView>
	);
}
