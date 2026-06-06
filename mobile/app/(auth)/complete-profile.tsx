import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import GradientButton from "@/components/ui/gradient-button";
import RemoteArtwork from "@/components/ui/remote-artwork";
import { ProfileInputProps } from "@/interfaces/ui.interface";
import { checkUsername, completeProfile as completeProfileRequest } from "@/lib/services/auth.service";
import { uploadSingleFile } from "@/lib/services/upload.service";
import { profileSchema } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteProfile() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const { registrationData, setRegistrationData, setAccessToken, setUser, setIsAuthenticated } = useAuthStore();
	const [fullName, setFullName] = useState<string>("");
	const [userName, setUserName] = useState<string>("");
	const [bankName, setBankName] = useState<string>("");
	const [accountNumber, setAccountNumber] = useState<string>("");
	const [photoUri, setPhotoUri] = useState<string | undefined>();
	const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
	const [usernameExists, setUsernameExists] = useState<boolean>(false);

	const generatedUserName = useMemo(
		() =>
			userName
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9_]/g, ""),
		[userName],
	);

	const signupMutation = useMutation({
		mutationKey: ["auth", "signup"],
		mutationFn: completeProfileRequest,
		onSuccess: (data) => {
			setAccessToken(data.token);
			setUser(data.user);
			setIsAuthenticated(true);
			router.replace("/home");
		},
	});

	const uploadImageMutation = useMutation({
		mutationKey: ["upload", "profile-image"],
		mutationFn: uploadSingleFile,
	});

	const checkUsernameMutation = useMutation({
		mutationKey: ["auth", "check-username"],
		mutationFn: checkUsername,
		onSuccess: (data) => {
			setUsernameExists(data.exists);
			setUsernameSuggestions(data.suggestions);
		},
	});

	const updateUsername = (value: string) => {
		setUserName(value);
		setUsernameExists(false);
		setUsernameSuggestions([]);
	};

	const verifyUsername = () => {
		if (generatedUserName.length >= 4) {
			checkUsernameMutation.mutate({ username: generatedUserName });
		}
	};

	const pickPhoto = async () => {
		const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!granted) {
			Alert.alert("Permission Denied", "Media library permission is needed to upload profile image.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) setPhotoUri(result.assets[0]?.uri);
	};

	const completeProfile = async () => {
		const names = fullName.trim().split(/\s+/);
		const firstName = names[0] ?? "";
		const lastName = names.slice(1).join(" ") || "User";

		const parsedProfile = profileSchema.safeParse({ fullName, userName: generatedUserName, bankName, accountNumber });
		if (!parsedProfile.success) {
			Alert.alert("Complete your profile", parsedProfile.error.issues[0]?.message ?? "Add your profile details to continue.");
			return;
		}

		if (usernameExists) {
			Alert.alert("Username unavailable", "Choose one of the suggested usernames or enter another username.");
			return;
		}

		let profileImage = photoUri;

		if (photoUri) {
			const formData = new FormData();
			formData.append("file", {
				uri: photoUri,
				name: getFileName(photoUri),
				type: getMimeType(photoUri),
			} as unknown as Blob);
			try {
				const uploaded = await uploadImageMutation.mutateAsync(formData);
				profileImage = uploaded.url;
			} catch {
				return;
			}
		}

		const payload = {
			email: registrationData.email,
			firstName,
			lastName,
			userName: generatedUserName,
			profileImage,
			bankName: parsedProfile.data.bankName,
			accountNumber: parsedProfile.data.accountNumber,
		};

		setRegistrationData({ firstName, lastName, userName: generatedUserName, profileImage });
		signupMutation.mutate(payload);
	};

	const isSubmitting = signupMutation.isPending || uploadImageMutation.isPending;

	return (
		<LinearGradient colors={isDark ? theme.gradients.darkBackground : theme.gradients.lightBackground} style={{ flex: 1 }}>
			<SafeAreaView className="flex-1">
				<AnimatedScreen>
					<View className="flex-row items-center justify-between px-7 pb-1.5 pt-5">
						<TouchableOpacity onPress={() => router.back()} className="h-[42px] w-[42px] items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surface }}>
							<Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
						</TouchableOpacity>
						<View className="flex-row items-center gap-[9px]">
							<Logo size={45} />
							<Text className="font-manrope text-[19px] font-black" style={{ color: theme.colors.textPrimary }}>
								AjoFlow
							</Text>
						</View>
						<View className="h-[42px] w-[42px]" />
					</View>

					<AnimatedSection delay={120} className="h-[250px] items-center justify-center">
						<View
							className="absolute left-7 top-2 z-10 h-16 w-[124px] flex-row items-center gap-2.5 rounded-[18px] px-3.5"
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
						<RemoteArtwork uri="https://res.cloudinary.com/dynopc0cn/image/upload/v1780677746/Container_2_szgvux.svg" width={260} height={238} />
					</AnimatedSection>

					<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
						<ScrollView className="flex-1" contentContainerClassName="px-5 pb-0" keyboardShouldPersistTaps="handled">
							<AnimatedSection delay={220} className="-mb-12">
								<View className="rounded-t-[34px] px-7 pb-20 pt-9" style={{ backgroundColor: theme.colors.surface }}>
									<Text className="font-manrope text-[30px] font-extrabold leading-9" style={{ color: theme.colors.textPrimary }}>
										Complete your profile
									</Text>
									<Text className="font-manrope mt-2 text-base leading-6" style={{ color: theme.colors.textSecondary }}>
										Just a few more details to get you started.
									</Text>

									<TouchableOpacity onPress={pickPhoto} className="mt-8 items-center">
										<View
											className="h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full border border-dashed"
											style={{ borderColor: theme.colors.textMuted, backgroundColor: theme.colors.surfaceMuted }}
										>
											{photoUri ? (
												<Image source={{ uri: photoUri }} style={{ width: 96, height: 96 }} contentFit="cover" />
											) : (
												<Ionicons name="camera" size={28} color={theme.colors.textMuted} />
											)}
										</View>
										<Text className="font-manrope mt-3 text-xs font-extrabold uppercase tracking-[1px]" style={{ color: theme.colors.warm }}>
											Add photo
										</Text>
									</TouchableOpacity>

									<ProfileInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="John Doe" />
									<ProfileInput label="Username" value={userName} onChangeText={updateUsername} onBlur={verifyUsername} placeholder="john_doe" autoCapitalize="none" />
									{usernameExists && usernameSuggestions.length > 0 && (
										<View className="mt-3 flex-row flex-wrap gap-2">
											{usernameSuggestions.map((suggestion) => (
												<TouchableOpacity
													key={suggestion}
													onPress={() => {
														setUserName(suggestion);
														setUsernameExists(false);
														setUsernameSuggestions([]);
													}}
													className="rounded-full px-3 py-2"
													style={{ backgroundColor: theme.colors.accentSurface }}
												>
													<Text className="font-manrope text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
														{suggestion}
													</Text>
												</TouchableOpacity>
											))}
										</View>
									)}
									<ProfileInput label="Bank name" value={bankName} onChangeText={setBankName} placeholder="Select your bank" />
									<ProfileInput label="Account number" value={accountNumber} onChangeText={setAccountNumber} placeholder="0123456789" keyboardType="number-pad" />

									<GradientButton onPress={completeProfile} loading={isSubmitting} label="Continue" contentClassName="h-[58px]" className="mt-7" />
								</View>
							</AnimatedSection>
						</ScrollView>
					</KeyboardAvoidingView>
				</AnimatedScreen>
			</SafeAreaView>
		</LinearGradient>
	);
}

function getFileName(uri: string) {
	const fallback = `profile-${Date.now()}.jpg`;
	return uri.split("/").pop()?.split("?")[0] || fallback;
}

function getMimeType(uri: string) {
	const extension = getFileName(uri).split(".").pop()?.toLowerCase();

	if (extension === "png") return "image/png";
	if (extension === "webp") return "image/webp";
	if (extension === "heic") return "image/heic";
	return "image/jpeg";
}

function ProfileInput({ label, value, placeholder, onChangeText, onBlur, autoCapitalize = "words", keyboardType = "default" }: ProfileInputProps) {
	const { theme } = useThemeStore();

	return (
		<View className="mt-6">
			<Text className="font-manrope mb-2 text-xs font-extrabold" style={{ color: theme.colors.textSecondary }}>
				{label}
			</Text>
			<TextInput
				value={value}
				onChangeText={onChangeText}
				onBlur={onBlur}
				placeholder={placeholder}
				placeholderTextColor={theme.colors.textMuted}
				autoCapitalize={autoCapitalize}
				keyboardType={keyboardType}
				className="h-[58px] rounded-2xl px-5 font-manrope text-base"
				style={{ backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.inputBorder }}
			/>
		</View>
	);
}
