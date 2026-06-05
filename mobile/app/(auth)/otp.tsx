import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import GradientButton from "@/components/ui/gradient-button";
import RemoteArtwork from "@/components/ui/remote-artwork";
import { resendEmailOtp, verifyEmailOtp } from "@/lib/services/auth.service";
import { otpSchema } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpVerification() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const { registrationData, setAccessToken, setUser } = useAuthStore();
	const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
	const inputs = useRef<(TextInput | null)[]>([]);

	const verifyMutation = useMutation({
		mutationKey: ["auth", "verify-email-otp"],
		mutationFn: verifyEmailOtp,
		onSuccess: (data) => {
			setAccessToken(data.token);
			setUser(data.user);
			router.push("/complete-profile");
		},
	});

	const resendMutation = useMutation({
		mutationKey: ["auth", "resend-email-otp"],
		mutationFn: resendEmailOtp,
		onSuccess: () => {
			setCode(["", "", "", "", "", ""]);
			inputs.current[0]?.focus();
		},
	});

	const setDigit = (value: string, index: number) => {
		const digit = value.replace(/\D/g, "").slice(-1);
		const next = [...code];
		next[index] = digit;
		setCode(next);

		if (digit && index < 5) {
			inputs.current[index + 1]?.focus();
		}
	};

	const verify = () => {
		const parsed = otpSchema.safeParse({ code: code.join("") });
		if (!parsed.success) {
			Alert.alert("Enter the full code", parsed.error.issues[0]?.message ?? "Use the 6-digit verification code sent to your email.");
			return;
		}

		verifyMutation.mutate({ email: registrationData.email, otp: parsed.data.code });
	};

	return (
		<LinearGradient colors={isDark ? theme.gradients.darkBackground : theme.gradients.lightBackground} style={{ flex: 1 }}>
			<SafeAreaView className="flex-1 px-7 pt-5">
				<AnimatedScreen>
				<View className="flex-row items-center justify-between">
					<TouchableOpacity onPress={() => router.back()} className="h-[42px] w-[42px] items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surface }}>
						<Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
					</TouchableOpacity>
					<View className="flex-row items-center gap-[9px]">
						<Logo size={34} />
						<Text className="font-manrope text-[19px] font-black" style={{ color: theme.colors.textPrimary }}>
							AjoFlow
						</Text>
					</View>
					<View className="h-[42px] w-[42px]" />
				</View>

				<AnimatedSection delay={120} className="h-72 items-center justify-center">
					<View
						className="absolute left-0 top-[34px] z-10 h-16 w-[124px] flex-row items-center gap-2.5 rounded-[18px] px-3.5"
						style={{ backgroundColor: theme.colors.surface, shadowColor: "#000000", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }}
					>
						<View className="h-[34px] w-[34px] items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.accentSurface }}>
							<Ionicons name="leaf" size={16} color={theme.colors.success} />
						</View>
						<View>
							<Text className="font-manrope text-[10px] font-bold" style={{ color: theme.colors.textMuted }}>
								Status
							</Text>
							<Text className="font-manrope text-[13px] font-black" style={{ color: theme.colors.textPrimary }}>
								Secured
							</Text>
						</View>
					</View>
					<RemoteArtwork uri="https://res.cloudinary.com/dynopc0cn/image/upload/v1780677746/Container_2_szgvux.svg" width={260} height={260} />
				</AnimatedSection>

				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end">
					<AnimatedSection delay={220} className="-mb-12">
					<View className="-mx-7 rounded-t-[34px] px-[31px] pb-[82px] pt-[38px]" style={{ backgroundColor: theme.colors.surface }}>
						<Text className="font-manrope text-[30px] font-extrabold leading-9" style={{ color: theme.colors.textPrimary }}>
							Verify your email
						</Text>
						<Text className="font-manrope mt-2 text-base leading-6" style={{ color: theme.colors.textSecondary }}>
							{"We've sent a 6-digit code to "}
							<Text className="font-bold" style={{ color: theme.colors.textPrimary }}>
								{registrationData.email || "your email"}
							</Text>
						</Text>

						<View className="mt-8 flex-row justify-between">
							{code.map((digit, index) => (
								<TextInput
									key={index}
									ref={(node) => {
										inputs.current[index] = node;
									}}
									value={digit}
									onChangeText={(value) => setDigit(value, index)}
									keyboardType="number-pad"
									maxLength={1}
									className="h-[56px] w-[48px] rounded-2xl text-center font-manrope text-xl font-extrabold"
									style={{ backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.inputBorder }}
								/>
							))}
						</View>

						<TouchableOpacity className="mt-8 items-center" onPress={() => resendMutation.mutate({ email: registrationData.email })} disabled={resendMutation.isPending}>
							<Text className="font-manrope text-sm" style={{ color: theme.colors.textSecondary }}>
								{"Didn't receive a code? "}
								<Text className="font-bold" style={{ color: theme.colors.warm }}>
									{resendMutation.isPending ? "Sending..." : "Resend Code"}
								</Text>
							</Text>
						</TouchableOpacity>

						<GradientButton onPress={verify} loading={verifyMutation.isPending} label="Verify & Proceed" contentClassName="h-[58px]" className="mt-7" />
					</View>
					</AnimatedSection>
				</KeyboardAvoidingView>
				</AnimatedScreen>
			</SafeAreaView>
		</LinearGradient>
	);
}
