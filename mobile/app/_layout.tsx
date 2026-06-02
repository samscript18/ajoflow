import { AppProvider } from "@/providers/providers";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
	const hasHiddenSplash = useRef(false);

	const [loaded] = useFonts({
		Manrope: require("../assets/fonts/Manrope-VariableFont_wght.ttf"),
	});

	useEffect(() => {
		if (loaded && !hasHiddenSplash.current) {
			hasHiddenSplash.current = true;
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [loaded]);

	if (!loaded) return null;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppProvider>
				<StatusBar style="auto" />
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
				</Stack>
			</AppProvider>
		</GestureHandlerRootView>
	);
}
