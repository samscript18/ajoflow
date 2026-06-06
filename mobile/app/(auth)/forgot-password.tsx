import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import PasswordInput from "@/components/auth/password-input";
import GradientButton from "@/components/ui/gradient-button";
import { useResendCooldown } from "@/hooks/useResendCooldown";
import { requestForgotPasswordToken, resetPassword, verifyResetOtp } from "@/lib/services/auth.service";
import { ForgotPasswordForm, ResetPasswordForm, forgotPasswordOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "email" | "otp" | "password";

export default function ForgotPassword() {
	const router = useRouter();
	const params = useLocalSearchParams<{ email?: string }>();
	const { theme, isDark } = useThemeStore();
	const { setPasswordResetStep } = useAuthStore();
	const [step, setStep] = useState<Step>("email");
	const [resetEmail, setResetEmail] = useState<string>((params.email ?? "").trim().toLowerCase());
	const [resetOtp, setResetOtp] = useState<string>("");
	const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
	const [focused, setFocused] = useState<string>("");
	const inputs = useRef<(TextInput | null)[]>([]);
	const { formattedTime, isCoolingDown, startCooldown } = useResendCooldown();

	const emailForm = useForm<ForgotPasswordForm>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: resetEmail },
		mode: "onChange",
	});
	const passwordForm = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
		mode: "onChange",
	});

	const codeValue = useMemo(() => code.join(""), [code]);

	useEffect(() => {
		setPasswordResetStep(step === "email" ? 1 : step === "otp" ? 2 : 3);
	}, [setPasswordResetStep, step]);

	const requestMutation = useMutation({
		mutationKey: ["auth", "forgot-password"],
		mutationFn: requestForgotPasswordToken,
		onSuccess: (_data, variables) => {
			if (step === "otp") startCooldown();
			setResetEmail(variables.email);
			setStep("otp");
			setTimeout(() => inputs.current[0]?.focus(), 260);
		},
	});

	const verifyMutation = useMutation({
		mutationKey: ["auth", "verify-reset-otp"],
		mutationFn: verifyResetOtp,
		onSuccess: (_data, variables) => {
			setResetOtp(variables.otp);
			setStep("password");
		},
	});

	const resetMutation = useMutation({
		mutationKey: ["auth", "reset-password"],
		mutationFn: resetPassword,
		onSuccess: () => {
			router.replace({
				pathname: "/status",
				params: {
					title: "Password reset",
					message: "Your password has been changed successfully. You can now log in securely.",
					nextLabel: "Back to login",
					nextHref: "/login",
				},
			});
		},
	});

	const submitEmail = (values: ForgotPasswordForm) => {
		Keyboard.dismiss();
		requestMutation.mutate({ email: values.email.trim().toLowerCase() });
	};

	const setDigit = (value: string, index: number) => {
		const digit = value.replace(/\D/g, "").slice(-1);
		const next = [...code];
		next[index] = digit;
		setCode(next);

		if (digit && index < 5) inputs.current[index + 1]?.focus();
	};

	const submitOtp = () => {
		const parsed = forgotPasswordOtpSchema.safeParse({ code: codeValue });
		if (!parsed.success) return;
		verifyMutation.mutate({ email: resetEmail, otp: parsed.data.code });
	};

	const submitPassword = (values: ResetPasswordForm) => {
		Keyboard.dismiss();
		resetMutation.mutate({ token: resetOtp, password: values.password });
	};

	const resendCode = () => {
		if (!resetEmail || requestMutation.isPending || isCoolingDown) return;
		requestMutation.mutate({ email: resetEmail });
	};

	const title = step === "email" ? "Forgot password?" : step === "otp" ? "Enter reset code" : "Create new password";
	const description = step === "email" ? "Enter your email address and we'll send you a code to reset your password." : step === "otp" ? `We sent a 6-digit code to ${resetEmail}.` : "Choose a strong password you have not used before.";

	return (
		<LinearGradient colors={isDark ? theme.gradients.darkBackground : theme.gradients.lightBackground} style={{ flex: 1 }}>
			<SafeAreaView className="flex-1 px-7 py-5">
				<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
					<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
						<AnimatedScreen>
							<View className="flex-row items-center justify-between">
								<TouchableOpacity
									onPress={() => (step === "email" ? router.back() : setStep(step === "password" ? "otp" : "email"))}
									className="h-11 w-11 items-center justify-center rounded-full"
									style={{ backgroundColor: theme.colors.surface }}
								>
									<Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
								</TouchableOpacity>
								<View className="flex-row items-center gap-2">
									<Logo size={45} />
									<Text className="font-manrope text-xl font-extrabold" style={{ color: theme.colors.textPrimary }}>
										AjoFlow
									</Text>
								</View>
								<View className="h-11 w-11" />
							</View>

							<AnimatedSection key={step} delay={140} className="flex-1 justify-center">
								<View className="rounded-2xl px-7 pb-8 pt-8" style={{ backgroundColor: theme.colors.surface }}>
									<View className="mb-8 items-center">
										<View className="h-28 w-28 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.accentSurface }}>
											<LinearGradient colors={theme.gradients.primary} className="h-16 w-16 items-center justify-center rounded-2xl">
												<Ionicons name={step === "password" ? "lock-closed" : "shield-checkmark"} size={31} color={theme.colors.onPrimary} />
											</LinearGradient>
										</View>
									</View>

									<Text className="font-manrope text-center text-[30px] font-extrabold" style={{ color: theme.colors.textPrimary }}>
										{title}
									</Text>
									<Text className="font-manrope mt-3 text-center text-sm font-semibold leading-6" style={{ color: theme.colors.textSecondary }}>
										{description}
									</Text>

									{step === "email" && (
										<>
											<View className="mt-8">
												<Text className="font-manrope mb-2 text-xs font-extrabold uppercase tracking-[1.8px]" style={{ color: theme.colors.textMuted }}>
													Email address
												</Text>
												<Controller
													control={emailForm.control}
													name="email"
													render={({ field: { value, onChange, onBlur } }) => (
														<View
															className="h-[58px] flex-row items-center rounded-2xl px-5"
															style={{
																backgroundColor: theme.colors.surfaceMuted,
																borderWidth: 1,
																borderColor: emailForm.formState.errors.email
																	? theme.colors.error
																	: focused === "email"
																		? theme.colors.primary
																		: theme.colors.inputBorder,
															}}
														>
															<TextInput
																value={value}
																onChangeText={onChange}
																onFocus={() => setFocused("email")}
																onBlur={() => {
																	onBlur();
																	setFocused("");
																}}
																placeholder="you@example.com"
																placeholderTextColor={theme.colors.textMuted}
																keyboardType="email-address"
																autoCapitalize="none"
																autoCorrect={false}
																className="flex-1 font-manrope text-base font-semibold"
																style={{ color: theme.colors.textPrimary }}
															/>
															<Ionicons
																name={emailForm.formState.errors.email ? "close-circle" : "mail-outline"}
																size={21}
																color={emailForm.formState.errors.email ? theme.colors.error : theme.colors.textMuted}
															/>
														</View>
													)}
												/>
												{emailForm.formState.errors.email?.message && (
													<Text className="mt-2 font-manrope text-xs font-semibold" style={{ color: theme.colors.error }}>
														{emailForm.formState.errors.email.message}
													</Text>
												)}
											</View>

											<GradientButton
												onPress={emailForm.handleSubmit(submitEmail)}
												loading={requestMutation.isPending}
												label="Send Reset Code"
												contentClassName="h-[58px]"
												className="mt-7"
												icon="mail"
											/>
										</>
									)}

									{step === "otp" && (
										<>
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
														style={{
															backgroundColor: theme.colors.surfaceMuted,
															color: theme.colors.textPrimary,
															borderWidth: 1,
															borderColor: theme.colors.inputBorder,
														}}
													/>
												))}
											</View>

											<TouchableOpacity className="mt-8 items-center" onPress={resendCode} disabled={requestMutation.isPending || isCoolingDown}>
												<Text className="font-manrope text-sm" style={{ color: theme.colors.textSecondary }}>
													{"Didn't receive a code? "}
													<Text className="font-bold" style={{ color: isCoolingDown ? theme.colors.textMuted : theme.colors.warm }}>
														{requestMutation.isPending ? "Sending..." : isCoolingDown ? `Resend in ${formattedTime}` : "Resend Code"}
													</Text>
												</Text>
											</TouchableOpacity>

											<GradientButton onPress={submitOtp} loading={verifyMutation.isPending} label="Verify Code" contentClassName="h-[58px]" className="mt-7" />
										</>
									)}

									{step === "password" && (
										<>
											<PasswordInput
												control={passwordForm.control}
												name="password"
												label="New password"
												focused={focused}
												setFocused={setFocused}
												show={showPassword}
												setShow={setShowPassword}
											/>
											<PasswordInput
												control={passwordForm.control}
												name="confirmPassword"
												label="Confirm password"
												focused={focused}
												setFocused={setFocused}
												show={showConfirmPassword}
												setShow={setShowConfirmPassword}
											/>
											{passwordForm.formState.errors.password?.message && (
												<Text className="mt-2 font-manrope text-xs font-semibold" style={{ color: theme.colors.error }}>
													{passwordForm.formState.errors.password.message}
												</Text>
											)}
											{passwordForm.formState.errors.confirmPassword?.message && (
												<Text className="mt-2 font-manrope text-xs font-semibold" style={{ color: theme.colors.error }}>
													{passwordForm.formState.errors.confirmPassword.message}
												</Text>
											)}
											<GradientButton
												onPress={passwordForm.handleSubmit(submitPassword)}
												loading={resetMutation.isPending}
												label="Reset Password"
												contentClassName="h-[58px]"
												className="mt-7"
												icon="lock-closed"
											/>
										</>
									)}

									<TouchableOpacity onPress={() => router.replace("/login")}>
										<Text className="font-manrope mt-8 text-center text-sm" style={{ color: theme.colors.textSecondary }}>
											Remember your password?{" "}
											<Text className="font-extrabold" style={{ color: theme.colors.warm }}>
												Back to login
											</Text>
										</Text>
									</TouchableOpacity>
								</View>
							</AnimatedSection>
						</AnimatedScreen>
					</KeyboardAvoidingView>
				</TouchableWithoutFeedback>
			</SafeAreaView>
		</LinearGradient>
	);
}
