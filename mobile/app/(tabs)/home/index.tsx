import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import GradientButton from "@/components/ui/gradient-button";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Home() {
	const { theme, toggleTheme } = useThemeStore();
	const { user, logout } = useAuthStore();
	const router = useRouter();

	return (
		<SafeAreaView className="flex-1 px-6 py-5" style={{ backgroundColor: theme.colors.background }}>
			<AnimatedScreen>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-3">
						<Logo size={44} />
						<View>
							<Text className="font-manrope text-xl font-extrabold" style={{ color: theme.colors.textPrimary }}>
								AjoFlow
							</Text>
							<Text className="font-manrope text-sm" style={{ color: theme.colors.textSecondary }}>
								Community savings made simple
							</Text>
						</View>
					</View>
					<TouchableOpacity onPress={toggleTheme} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surface }}>
						<Ionicons name="contrast-outline" size={21} color={theme.colors.textPrimary} />
					</TouchableOpacity>
				</View>

				<AnimatedSection delay={120}>
					<LinearGradient colors={theme.gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="mt-8 rounded-2xl p-6">
						<Text className="font-manrope text-sm font-bold uppercase tracking-[2px]" style={{ color: theme.colors.onPrimary }}>
							Welcome
						</Text>
						<Text className="font-manrope mt-3 text-3xl font-extrabold" style={{ color: theme.colors.onPrimary }}>
							{user?.firstName ? `${user.firstName}, your dashboard is ready.` : "Your dashboard is ready."}
						</Text>
					</LinearGradient>
				</AnimatedSection>

				<GradientButton
					onPress={() => {
						logout();
						router.replace("/login");
					}}
					label="Sign out"
					icon="log-out-outline"
					className="mt-auto"
					contentClassName="h-14"
				/>
			</AnimatedScreen>
		</SafeAreaView>
	);
}
