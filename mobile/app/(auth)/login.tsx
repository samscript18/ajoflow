import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import GradientButton from "@/components/ui/gradient-button";
import RemoteArtwork from "@/components/ui/remote-artwork";
import { useDebounce } from "@/hooks/useDebounce";
import { isGoogleSignInAvailable } from "@/lib/config/google";
import { checkEmail, googleAuth, login, signup } from "@/lib/services/auth.service";
import { AuthEntryForm, authEntrySchema, passwordValidation } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { User } from "@/types/user/user";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
	const router = useRouter();
	const { theme, isDark, toggleTheme } = useThemeStore();
	const { setAccessToken, setUser, setIsAuthenticated, setRegistrationData } = useAuthStore();
	const [emailExists, setEmailExists] = useState<boolean | null>(null);
	const [lastCheckedEmail, setLastCheckedEmail] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [focused, setFocused] = useState<"email" | "password" | null>(null);
	const {
		control,
		handleSubmit,
		watch,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<AuthEntryForm>({
		resolver: zodResolver(authEntrySchema),
		defaultValues: { email: "", password: "" },
		mode: "onChange",
	});
	const watchedEmail = watch("email");
	const debouncedEmail = useDebounce(watchedEmail.trim().toLowerCase(), 650);

	const applyAuth = (data: { token: string; user: User }) => {
		setAccessToken(data.token);
		setUser(data.user);
		setIsAuthenticated(true);
		router.replace("/home");
	};

	const checkEmailMutation = useMutation({
		mutationKey: ["auth", "check-email"],
		mutationFn: checkEmail,
		onSuccess: (data, variables) => {
			setLastCheckedEmail(variables.email);
			setEmailExists(data.exists);
			clearErrors("email");
		},
		onError: () => {
			setEmailExists(null);
			setLastCheckedEmail("");
		},
	});

	const loginMutation = useMutation({
		mutationKey: ["auth", "login"],
		mutationFn: login,
		onSuccess: applyAuth,
	});

	const googleMutation = useMutation({
		mutationKey: ["auth", "google"],
		mutationFn: googleAuth,
		onSuccess: applyAuth,
	});

	const signupMutation = useMutation({
		mutationKey: ["auth", "signup"],
		mutationFn: signup,
		onSuccess: (_data, variables) => {
			setRegistrationData({ email: variables.email, password: variables.password });
			router.push("/otp");
		},
	});

	useEffect(() => {
		const parsed = authEntrySchema.shape.email.safeParse(debouncedEmail);
		if (!parsed.success || debouncedEmail === lastCheckedEmail || checkEmailMutation.isPending) return;

		setEmailExists(null);
		checkEmailMutation.mutate({ email: parsed.data });
	}, [checkEmailMutation, debouncedEmail, lastCheckedEmail]);

	const handleContinue = (values: AuthEntryForm) => {
		Keyboard.dismiss();
		const cleanEmail = values.email.trim().toLowerCase();

		if (emailExists === null || cleanEmail !== lastCheckedEmail) {
			setError("email", { message: "Give us a moment to verify this email address." });
			checkEmailMutation.mutate({ email: cleanEmail });
			return;
		}

		const password = values.password ?? "";

		if (emailExists) {
			if (!password) {
				setError("password", { message: "Enter your password" });
				return;
			}

			loginMutation.mutate({ email: cleanEmail, password });
			return;
		}

		const parsedPassword = passwordValidation.safeParse(password);
		if (!parsedPassword.success) {
			setError("password", { message: parsedPassword.error.issues[0]?.message ?? "Use a stronger password." });
			return;
		}

		signupMutation.mutate({ email: cleanEmail, password: parsedPassword.data });
	};

	const handleForgotPassword = () => {
		const cleanEmail = watchedEmail.trim().toLowerCase();
		router.push({
			pathname: "/forgot-password",
			params: cleanEmail ? { email: cleanEmail } : undefined,
		});
	};

	const isBusy = checkEmailMutation.isPending || loginMutation.isPending || googleMutation.isPending || signupMutation.isPending;
	// const emailStatusIcon = errors.email ? "close-circle" : emailExists !== null && watchedEmail.trim().toLowerCase() === lastCheckedEmail ? "checkmark-circle" : "mail-outline";
	// const emailStatusColor = errors.email ? theme.colors.error : emailExists !== null && watchedEmail.trim().toLowerCase() === lastCheckedEmail ? theme.colors.success : theme.colors.textMuted;

	return (
		<LinearGradient colors={isDark ? theme.gradients.darkBackground : theme.gradients.lightBackground} style={{ flex: 1 }}>
			<SafeAreaView className="flex-1">
				<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
					<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
						<AnimatedScreen>
							<View className="px-[30px] pt-[18px]">
								<View className="flex-row items-center justify-between">
									<TouchableOpacity
										onPress={() => router.push("/onboarding" as never)}
										className="h-[42px] w-[42px] items-center justify-center rounded-full"
										style={{ backgroundColor: theme.colors.surface }}
									>
										<Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
									</TouchableOpacity>
									<View className="flex-row items-center gap-[9px]">
										<Logo size={34} />
										<Text className="font-manrope text-[19px] font-black" style={{ color: theme.colors.textPrimary }}>
											AjoFlow
										</Text>
									</View>
									<TouchableOpacity
										onPress={toggleTheme}
										className="h-[42px] w-[42px] items-center justify-center rounded-full"
										style={{ backgroundColor: theme.colors.surface }}
									>
										<Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color={theme.colors.textPrimary} />
									</TouchableOpacity>
								</View>
							</View>

							<AnimatedSection delay={120} className="mx-auto mt-7 h-[260px] w-[260px] items-center justify-center">
								<RemoteArtwork uri="https://res.cloudinary.com/dynopc0cn/image/upload/v1780677747/Container_4_ihmsel.svg" width={260} height={260} />
							</AnimatedSection>

							<AnimatedSection delay={220} className="flex-1 -mb-10 justify-end">
								<View className="rounded-t-3xl px-[31px] pb-[30px] pt-[38px]" style={{ backgroundColor: theme.colors.surface }}>
									<Text className="font-manrope text-[30px] font-black leading-9" style={{ color: theme.colors.textPrimary }}>
										Welcome back
									</Text>
									<Text className="mt-2 font-manrope text-[15px] font-semibold leading-[23px]" style={{ color: theme.colors.textSecondary }}>
										Your money. Your community. <Text style={{ color: theme.colors.warm, fontWeight: "800" }}>Fully transparent.</Text>
									</Text>

									<View className="mt-[34px]">
										<Text className="mb-2.5 font-manrope text-[11px] font-black uppercase tracking-[1.8px]" style={{ color: theme.colors.textMuted }}>
											Email address
										</Text>
										<Controller
											control={control}
											name="email"
											render={({ field: { value, onChange, onBlur } }) => (
												<View
													className="h-[58px] flex-row items-center rounded-2xl px-5"
													style={{
														backgroundColor: theme.colors.surfaceMuted,
														borderWidth: 1,
														borderColor: errors.email
															? theme.colors.error
															: focused === "email"
																? theme.colors.primary
																: theme.colors.inputBorder,
													}}
												>
													<TextInput
														value={value}
														onChangeText={(text) => {
															onChange(text);
															setEmailExists(null);
															setLastCheckedEmail("");
														}}
														onFocus={() => setFocused("email")}
														onBlur={() => {
															onBlur();
															setFocused(null);
														}}
														placeholder="you@example.com"
														placeholderTextColor={theme.colors.textMuted}
														keyboardType="email-address"
														autoCapitalize="none"
														autoCorrect={false}
														className="flex-1 font-manrope text-base font-semibold"
														style={{ color: theme.colors.textPrimary }}
													/>
													{/* <Ionicons name={emailStatusIcon} size={21} color={emailStatusColor} /> */}
												</View>
											)}
										/>
										<Text
											className="mt-2 font-manrope text-xs font-semibold"
											style={{ color: errors.email ? theme.colors.error : emailExists === false ? theme.colors.success : theme.colors.textMuted }}
										>
											{errors.email?.message ?? (checkEmailMutation.isPending ? "Checking email..." : null)}
										</Text>
									</View>

									{emailExists !== null && (
										<View className="mt-5">
											<Text className="mb-2.5 font-manrope text-[11px] font-black uppercase tracking-[1.8px]" style={{ color: theme.colors.textMuted }}>
												Password
											</Text>
											<View
												className="h-[58px] flex-row items-center rounded-2xl px-5"
												style={{
													backgroundColor: theme.colors.surfaceMuted,
													borderWidth: 1,
													borderColor: focused === "password" ? theme.colors.primary : theme.colors.inputBorder,
												}}
											>
												<Controller
													control={control}
													name="password"
													render={({ field: { value, onChange, onBlur } }) => (
														<TextInput
															value={value}
															onChangeText={(text) => {
																onChange(text);
																clearErrors("password");
															}}
															onFocus={() => setFocused("password")}
															onBlur={() => {
																onBlur();
																setFocused(null);
															}}
															placeholder={emailExists ? "Enter your password" : "Create a password"}
															placeholderTextColor={theme.colors.textMuted}
															secureTextEntry={!showPassword}
															className="flex-1 font-manrope text-base font-semibold"
															style={{ color: theme.colors.textPrimary }}
														/>
													)}
												/>
												<TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
													<Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={theme.colors.textSecondary} />
												</TouchableOpacity>
											</View>
											{errors.password?.message && (
												<Text className="mt-2 font-manrope text-xs font-semibold" style={{ color: theme.colors.error }}>
													{errors.password.message}
												</Text>
											)}
										</View>
									)}

									<GradientButton
										onPress={handleSubmit(handleContinue)}
										loading={isBusy}
										label={emailExists === null ? "Continue" : emailExists ? "Login" : "Create account"}
										contentClassName="h-[58px]"
									/>

									<View className="mt-[30px] flex-row items-center gap-4">
										<View className="h-px flex-1" style={{ backgroundColor: theme.colors.divider }} />
										<Text className="font-manrope text-[11px] font-extrabold uppercase tracking-[2px]" style={{ color: theme.colors.textMuted }}>
											Secure access
										</Text>
										<View className="h-px flex-1" style={{ backgroundColor: theme.colors.divider }} />
									</View>

									{isGoogleSignInAvailable && (
										<TouchableOpacity
											onPress={() => googleMutation.mutate()}
											className="mt-6 h-[54px] flex-row items-center justify-center gap-3 rounded-2xl border"
											style={{ borderColor: theme.colors.border }}
										>
											<Ionicons name="logo-google" size={23} color={theme.colors.googleBrand} />
											<Text className="font-manrope text-[15px] font-extrabold" style={{ color: theme.colors.textPrimary }}>
												Continue with Google
											</Text>
										</TouchableOpacity>
									)}

									<TouchableOpacity onPress={handleForgotPassword}>
										<Text className="mt-[26px] text-center font-manrope text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
											Forgot your password? <Text style={{ color: theme.colors.warm, fontWeight: "900" }}>Reset it securely</Text>
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
