import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import GradientButton from "@/components/ui/gradient-button";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthStatus() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const params = useLocalSearchParams<{ title?: string; message?: string; nextLabel?: string; nextHref?: string }>();
	const title = params.title ?? "All set";
	const message = params.message ?? "Your action was completed successfully.";
	const nextLabel = params.nextLabel ?? "Continue";
	const nextHref = params.nextHref ?? "/login";

	return (
		<LinearGradient colors={isDark ? theme.gradients.darkBackground : theme.gradients.lightBackground} style={{ flex: 1 }}>
			<SafeAreaView className="flex-1 px-7 py-5">
				<AnimatedScreen>
				<View className="items-center">
					<Logo size={42} />
				</View>

				<View className="flex-1 justify-center">
					<AnimatedSection delay={140}>
					<View className="items-center rounded-[34px] px-7 py-10" style={{ backgroundColor: theme.colors.surface }}>
						<View className="h-28 w-28 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.accentSurface }}>
							<LinearGradient colors={theme.gradients.primary} className="h-16 w-16 items-center justify-center rounded-2xl">
								<Ionicons name="checkmark" size={34} color={theme.colors.onPrimary} />
							</LinearGradient>
						</View>

						<Text className="font-manrope mt-8 text-center text-[30px] font-extrabold" style={{ color: theme.colors.textPrimary }}>
							{title}
						</Text>
						<Text className="font-manrope mt-3 text-center text-base leading-6" style={{ color: theme.colors.textSecondary }}>
							{message}
						</Text>

						<GradientButton onPress={() => router.replace(nextHref as never)} label={nextLabel} className="mt-9 w-full" contentClassName="h-[58px]" icon="arrow-forward" />
					</View>
					</AnimatedSection>
				</View>
				</AnimatedScreen>
			</SafeAreaView>
		</LinearGradient>
	);
}
