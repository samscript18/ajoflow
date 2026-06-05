import { AppProvider } from "@/providers/providers";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeStore } from "@/store/useThemeStore";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
	const hasHiddenSplash = useRef(false);
	const isDark = useThemeStore((state) => state.isDark);

	const [loaded, fontError] = useFonts({
		Manrope: require("../assets/fonts/Manrope-VariableFont_wght.ttf"),
	});

	useEffect(() => {
		if ((loaded || fontError) && !hasHiddenSplash.current) {
			hasHiddenSplash.current = true;
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [loaded, fontError]);

	if (!loaded && !fontError) return <View style={{ flex: 1, backgroundColor: "#F7F6F2" }} />;

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
