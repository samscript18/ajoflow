import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import GradientButton from "@/components/ui/gradient-button";
import RemoteArtwork from "@/components/ui/remote-artwork";
import { onboardingSlides } from "@/data/data";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
	const router = useRouter();
	const { theme } = useThemeStore();
	const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);
	const [index, setIndex] = useState<number>(0);
	const slide = onboardingSlides[index];
	const isLast = index === onboardingSlides.length - 1;
	const width = Dimensions.get("window").width;
	const visualWidth = Math.min(width - 72, index === 2 ? 354 : 330);
	const visualHeight = index === 2 ? visualWidth * 1.02 : visualWidth;

	const finish = () => {
		setHasCompletedOnboarding(true);
		router.replace("/login");
	};

	const next = () => {
		if (isLast) {
			finish();
			return;
		}

		setIndex((value) => value + 1);
	};

	return (
		<LinearGradient colors={theme.mode === "dark" ? theme.gradients.darkBackground : theme.gradients.lightBackground} className="overflow-hidden" style={{ flex: 1, backgroundColor: theme.colors.background, height: "100%" }}>
			<View pointerEvents="none" className="absolute top-[32%] left-8 h-[340px] w-[340px] rounded-full border" style={{ borderColor: `${theme.colors.coral}24` }} />

			<SafeAreaView className="flex-1 px-[34px] pb-4">
				<AnimatedScreen>
					<View className="h-[45px] flex-row items-center justify-between">
						{index === 2 ? <Logo size={100} style={{ margin: "auto" }} /> : <View className="h-1 w-auto" />}
						{!isLast ? (
							<TouchableOpacity onPress={finish} hitSlop={12} className="justify-center px-0.5">
								<Text className="font-manrope text-sm font-extrabold tracking-[2px]" style={{ color: theme.colors.textSecondary }}>
									SKIP
								</Text>
							</TouchableOpacity>
						) : (
							<View className="h-6 w-6" />
						)}
					</View>

					<AnimatedSection key={`artwork-${index}`} delay={120} className={index === 2 ? "mt-1 h-[354px] items-center justify-center" : "mt-1 h-[330px] items-center justify-center"}>
						<RemoteArtwork uri={slide.image} width={visualWidth} height={visualHeight} />
					</AnimatedSection>

					{index !== 2 && <Logo size={80} style={{ alignSelf: "center", marginTop: 4 }} />}

					<AnimatedSection key={`copy-${index}`} delay={220} className="mt-1 items-center">
						<Text className="text-center font-manrope text-3xl font-black leading-[37px]" style={{ color: theme.colors.textPrimary }}>
							{slide.title}
							{"\n"}
							<Text style={{ color: index === 0 ? theme.colors.coral : theme.colors.gold }}>{slide.accent}</Text>
						</Text>
						<Text className="mt-4 max-w-[318px] text-center font-manrope text-base font-medium leading-[27px]" style={{ color: theme.colors.textSecondary }}>
							{slide.body}
						</Text>
					</AnimatedSection>

					<AnimatedSection delay={320} className="absolute bottom-0 left-0 w-full">
						<View className={`${index === 2 ? "mt-20" : "mt-10"} h-2.5 flex-row items-center justify-center gap-[9px]`}>
							{onboardingSlides.map((_, dotIndex) => (
								<View
									key={dotIndex}
									className="h-2 rounded-full"
									style={{ width: dotIndex === index ? 36 : 8, backgroundColor: dotIndex === index ? theme.colors.gold : theme.colors.dot }}
								/>
							))}
						</View>

						<GradientButton onPress={next} label={isLast ? "Get Started" : "Next"} className={`${index === 2 ? "mt-10" : "mt-6"} overflow-hidden rounded-[18px]`} />
					</AnimatedSection>
				</AnimatedScreen>
			</SafeAreaView>
		</LinearGradient>
	);
}
