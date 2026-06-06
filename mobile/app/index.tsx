import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Index() {
	const router = useRouter();
	const { hasCompletedOnboarding, isAuthenticated, user } = useAuthStore();
	const { theme } = useThemeStore();

	const progress = useSharedValue<number>(0);

	useEffect(() => {
		progress.value = withTiming(100, {
			duration: 3000,
		});

		const timeout = setTimeout(() => {
			if (!hasCompletedOnboarding) {
				router.replace("/onboarding");
				return;
			}

			if (!isAuthenticated) {
				router.replace("/login");
				return;
			}

			router.replace(user?.isProfileCompleted ? "/home" : "/complete-profile");
		}, 3000);

		return () => clearTimeout(timeout);
	}, [hasCompletedOnboarding, isAuthenticated, progress, router, user?.isProfileCompleted]);

	const progressStyle = useAnimatedStyle(() => ({
		width: `${progress.value}%`,
	}));

	return (
		<LinearGradient
			colors={theme.mode === "dark" ? theme.gradients.darkBackground : theme.gradients.lightBackground}
			className="flex-1 overflow-x-hidden"
			style={{
				backgroundColor: theme.colors.background,
				height: "100%",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<View pointerEvents="none" className="absolute top-[25%] h-[340px] w-[340px] rounded-full border" style={{ borderColor: `${theme.colors.coral}24` }} />

			<AnimatedScreen className="-mt-40 items-center">
				<AnimatedSection delay={100} className="items-center">
					<Logo size={150} />

					<Text className="mt-6 font-manrope text-[40px] font-extrabold" style={{ color: theme.colors.textPrimary }}>
						AjoFlow
					</Text>

					<Text className="mt-3 font-manrope text-sm font-bold tracking-[3px]" style={{ color: theme.colors.textSecondary }}>
						COMMUNITY SAVINGS MADE SIMPLE
					</Text>
				</AnimatedSection>
			</AnimatedScreen>

			<AnimatedSection delay={260} className="absolute bottom-[80px] items-center">
				<View
					className="mb-8 h-[54px] w-[54px] items-center justify-center rounded-full border"
					style={{
						borderColor: `${theme.colors.coral}73`,
						backgroundColor: theme.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.68)",
						shadowColor: theme.colors.coral,
						shadowOpacity: 0.5,
						shadowRadius: 18,
						shadowOffset: { width: 0, height: 0 },
					}}
				>
					<View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.colors.gold }} />
				</View>

				<View className="h-2 w-44 overflow-hidden rounded-full bg-white/20">
					<AnimatedLinearGradient
						colors={[theme.colors.coral, theme.colors.gold]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={[
							{
								height: "100%",
								borderRadius: 999,
							},
							progressStyle,
						]}
					/>
				</View>
			</AnimatedSection>
		</LinearGradient>
	);
}
