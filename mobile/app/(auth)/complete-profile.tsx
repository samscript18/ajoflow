import Logo from "@/components/ui/logo";
import { AnimatedScreen, AnimatedSection } from "@/components/ui/animated-screen";
import BankLogo from "@/components/profile/bank-logo";
import BankSelect from "@/components/profile/bank-select";
import GradientButton from "@/components/ui/gradient-button";
import ProfileInput from "@/components/profile/profile-input";
import RemoteArtwork from "@/components/ui/remote-artwork";
import { useDebounce } from "@/hooks/useDebounce";
import { checkUsername, completeProfile as completeProfileRequest } from "@/lib/services/auth.service";
import { listBanks, resolveBankAccount } from "@/lib/services/paystack.service";
import { uploadSingleFile } from "@/lib/services/upload.service";
import { getFileName, getMimeType } from "@/lib/utils";
import { profileSchema } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Bank } from "@/types/paystack/paystack";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteProfile() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const { registrationData, setRegistrationData, setAccessToken, setUser, setIsAuthenticated, user } = useAuthStore();
	const [fullName, setFullName] = useState<string>("");
	const [userName, setUserName] = useState<string>("");
	const [bankCode, setBankCode] = useState<string>("");
	const [accountNumber, setAccountNumber] = useState<string>("");
	const [accountName, setAccountName] = useState<string>("");
	const [bankPickerOpen, setBankPickerOpen] = useState<boolean>(false);
	const [bankSearch, setBankSearch] = useState<string>("");
	const [photoUri, setPhotoUri] = useState<string | undefined>();
	const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
	const [usernameExists, setUsernameExists] = useState<boolean>(false);
	const [checkedUsername, setCheckedUsername] = useState<string>("");

	const generatedUserName = useMemo(
		() =>
			userName
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9_]/g, ""),
		[userName],
	);

	const debouncedUserName = useDebounce(generatedUserName, 550);

	const banksQuery = useQuery({
		queryKey: ["paystack", "banks"],
		queryFn: listBanks,
	});
	const banks = useMemo(() => banksQuery.data ?? [], [banksQuery.data]);
	const selectedBank = banks.find((bank) => bank.code === bankCode);
	const filteredBanks = useMemo(() => {
		const query = bankSearch.trim().toLowerCase();
		if (!query) return banks;
		return banks.filter((bank) => bank.name.toLowerCase().includes(query));
	}, [bankSearch, banks]);

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

	const { mutate: checkUsernameAvailability, isPending: isCheckingUsername } = useMutation({
		mutationKey: ["auth", "check-username"],
		mutationFn: checkUsername,
		onSuccess: (data, variables) => {
			setCheckedUsername(variables.username);
			setUsernameExists(data.exists);
			setUsernameSuggestions(data.suggestions);
		},
		onError: () => {
			setCheckedUsername("");
			setUsernameExists(false);
			setUsernameSuggestions([]);
		},
	});

	const {
		mutate: resolveAccount,
		isPending: isResolvingAccount,
		isError: isAccountResolveError,
	} = useMutation({
		mutationKey: ["paystack", "resolve-bank-account"],
		mutationFn: resolveBankAccount,
		onSuccess: (data) => setAccountName(data.accountName),
		onError: () => setAccountName(""),
	});

	useEffect(() => {
		setAccountName("");
		if (!bankCode || accountNumber.length !== 10) return;
		resolveAccount({ bankCode, accountNumber });
	}, [bankCode, accountNumber, resolveAccount]);

	useEffect(() => {
		setUsernameSuggestions([]);

		if (debouncedUserName.length < 4) {
			setCheckedUsername("");
			setUsernameExists(false);
			return;
		}

		checkUsernameAvailability({ username: debouncedUserName });
	}, [checkUsernameAvailability, debouncedUserName]);

	const updateUsername = (value: string) => {
		setUserName(value);
		setCheckedUsername("");
		setUsernameExists(false);
		setUsernameSuggestions([]);
	};

	const updateAccountNumber = (value: string) => {
		setAccountNumber(value.replace(/\D/g, "").slice(0, 10));
	};

	const selectBank = (bank: Bank) => {
		setBankCode(bank.code);
		setBankSearch("");
		setBankPickerOpen(false);
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

	const handleBack = () => {
		router.replace(user?.isEmailVerified ? "/login" : "/otp");
	};

	const completeProfile = async () => {
		const names = fullName.trim().split(/\s+/);
		const firstName = names[0] ?? "";
		const lastName = names.slice(1).join(" ") || "User";
		const bankName = selectedBank?.name ?? "";

		const parsedProfile = profileSchema.safeParse({ fullName, userName: generatedUserName, bankName, bankCode, accountName, accountNumber });
		if (!parsedProfile.success) {
			Alert.alert("Complete your profile", parsedProfile.error.issues[0]?.message ?? "Add your profile details to continue.");
			return;
		}

		if (generatedUserName.length >= 4 && (isCheckingUsername || checkedUsername !== generatedUserName)) {
			Alert.alert("Checking username", "Wait a moment while we confirm this username is available.");
			return;
		}

		if (usernameExists) {
			Alert.alert("Username unavailable", "Choose one of the suggested usernames or enter another username.");
			return;
		}

		if ((bankCode || accountNumber) && (!bankCode || accountNumber.length !== 10)) {
			Alert.alert("Bank details", "Select your bank and enter a 10-digit account number.");
			return;
		}

		if (bankCode && accountNumber && !accountName) {
			Alert.alert("Bank details", "Wait for your account name to resolve before continuing.");
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
			email: registrationData.email || user?.email || "",
			firstName,
			lastName,
			userName: generatedUserName,
			profileImage,
			bankName: bankName || undefined,
			bankCode: bankCode || undefined,
			accountName: accountName || undefined,
			accountNumber: accountNumber || undefined,
		};

		setRegistrationData({ firstName, lastName, userName: generatedUserName, profileImage });
		signupMutation.mutate(payload);
	};

	const isSubmitting = signupMutation.isPending || uploadImageMutation.isPending;
	const showUsernameStatus = generatedUserName.length > 0;
	const usernameIsTooShort = showUsernameStatus && generatedUserName.length < 4;
	const usernameCheckIsCurrent = checkedUsername === generatedUserName;
	const usernameStatusElement = showUsernameStatus ? (
		usernameIsTooShort ? (
			<Ionicons name="close-circle" size={21} color={theme.colors.error} />
		) : isCheckingUsername || !usernameCheckIsCurrent ? (
			<ActivityIndicator size="small" color={theme.colors.primary} />
		) : usernameExists ? (
			<Ionicons name="close-circle" size={21} color={theme.colors.error} />
		) : (
			<Ionicons name="checkmark-circle" size={21} color={theme.colors.success} />
		)
	) : undefined;

	return (
		<LinearGradient colors={isDark ? theme.gradients.darkBackground : theme.gradients.lightBackground} style={{ flex: 1 }}>
			<SafeAreaView className="flex-1">
				<AnimatedScreen className="flex-1">
					<View className="flex-row items-center justify-between px-7 pb-1.5 pt-5">
						<TouchableOpacity onPress={handleBack} className="h-[42px] w-[42px] items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surface }}>
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

					<AnimatedSection delay={120} className="h-[220px] items-center justify-center">
						<RemoteArtwork uri="https://res.cloudinary.com/dynopc0cn/image/upload/v1780677747/Container_3_dkw5j5.svg" width={280} height={238} />
					</AnimatedSection>

					<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
						<AnimatedSection delay={220} className="-mb-10 flex-1 justify-end">
							<View className="flex-1 rounded-t-[34px] px-7 pt-8" style={{ backgroundColor: theme.colors.surface }}>
								<ScrollView className="flex-1" contentContainerClassName="pb-20" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
									<Text className="font-manrope text-[30px] font-extrabold leading-9" style={{ color: theme.colors.textPrimary }}>
										Complete your profile
									</Text>
									<Text className="font-manrope mt-2 text-base leading-6" style={{ color: theme.colors.textSecondary }}>
										Just a few more details to get you started.
									</Text>

									<TouchableOpacity onPress={pickPhoto} className="mt-7 items-center">
										<View
											className="h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border border-dashed"
											style={{ borderColor: theme.colors.textMuted, backgroundColor: theme.colors.surfaceMuted }}
										>
											{photoUri ? (
												<Image source={{ uri: photoUri }} style={{ width: 88, height: 88 }} contentFit="cover" />
											) : (
												<Ionicons name="camera" size={26} color={theme.colors.textMuted} />
											)}
										</View>
										<Text className="font-manrope mt-3 text-xs font-extrabold uppercase tracking-[1px]" style={{ color: theme.colors.warm }}>
											Add photo
										</Text>
									</TouchableOpacity>

									<ProfileInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="John Doe" />
									<ProfileInput label="Username" value={userName} onChangeText={updateUsername} placeholder="john_doe" autoCapitalize="none" rightElement={usernameStatusElement} />
									{usernameExists && usernameSuggestions.length > 0 && (
										<View className="mt-3 flex-row flex-wrap gap-2">
											{usernameSuggestions.map((suggestion) => (
												<TouchableOpacity
													key={suggestion}
													onPress={() => {
														updateUsername(suggestion);
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

									<BankSelect
										label="Bank name"
										value={selectedBank?.name ?? ""}
										placeholder={banksQuery.isLoading ? "Loading banks..." : "Select your bank"}
										onPress={() => setBankPickerOpen(true)}
									/>
									<ProfileInput label="Account number" value={accountNumber} onChangeText={updateAccountNumber} placeholder="0123456789" keyboardType="number-pad" />

									{accountNumber.length === 10 && bankCode && (
										<View className="mt-3 rounded-2xl border px-4 py-3" style={{ backgroundColor: theme.colors.accentSurface, borderColor: theme.colors.inputBorder }}>
											{isResolvingAccount ? (
												<View className="flex-row items-center gap-2">
													<ActivityIndicator size="small" color={theme.colors.primary} />
													<Text className="font-manrope text-xs font-bold" style={{ color: theme.colors.textSecondary }}>
														Resolving account name...
													</Text>
												</View>
											) : accountName ? (
												<View className="flex-row items-start gap-2">
													<Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
													<View className="flex-1">
														<Text
															className="font-manrope text-xs font-extrabold uppercase tracking-[1px]"
															style={{ color: theme.colors.success }}
														>
															Account verified
														</Text>
														<Text className="font-manrope mt-1 text-sm font-black" style={{ color: theme.colors.textPrimary }}>
															{accountName}
														</Text>
													</View>
												</View>
											) : isAccountResolveError ? (
												<View className="flex-row items-center gap-2">
													<Ionicons name="alert-circle" size={18} color={theme.colors.error} />
													<Text className="font-manrope text-xs font-bold" style={{ color: theme.colors.error }}>
														Unable to resolve account. Check the bank and account number.
													</Text>
												</View>
											) : null}
										</View>
									)}

									<GradientButton onPress={completeProfile} loading={isSubmitting} label="Continue" contentClassName="h-[58px]" className="mt-7" />
								</ScrollView>
							</View>
						</AnimatedSection>
					</KeyboardAvoidingView>
				</AnimatedScreen>
			</SafeAreaView>

			<Modal visible={bankPickerOpen} transparent animationType="slide" onRequestClose={() => setBankPickerOpen(false)}>
				<View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.32)" }}>
					<View className="max-h-[78%] rounded-t-[28px] px-5 pb-8 pt-5" style={{ backgroundColor: theme.colors.surface }}>
						<View className="mb-4 flex-row items-center justify-between">
							<Text className="font-manrope text-xl font-black" style={{ color: theme.colors.textPrimary }}>
								Select your bank
							</Text>
							<TouchableOpacity onPress={() => setBankPickerOpen(false)} className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surfaceMuted }}>
								<Ionicons name="close" size={19} color={theme.colors.textPrimary} />
							</TouchableOpacity>
						</View>
						<TextInput
							value={bankSearch}
							onChangeText={setBankSearch}
							placeholder="Search banks"
							placeholderTextColor={theme.colors.textMuted}
							className="mb-3 h-[50px] rounded-2xl px-4 font-manrope text-base"
							style={{ backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.inputBorder }}
						/>
						<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
							{filteredBanks.map((bank, index) => (
								<TouchableOpacity
									key={`${bank.code}-${index}`}
									onPress={() => selectBank(bank)}
									className="flex-row items-center justify-between border-b py-4"
									style={{ borderBottomColor: theme.colors.divider }}
								>
									<View className="flex-1 flex-row items-center gap-3 pr-3">
										<BankLogo bank={bank} />
										<Text className="flex-1 font-manrope text-sm font-extrabold" style={{ color: theme.colors.textPrimary }}>
											{bank.name}
										</Text>
									</View>
									{bank.code === bankCode && <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />}
								</TouchableOpacity>
							))}
							{filteredBanks.length === 0 && (
								<Text className="py-8 text-center font-manrope text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
									No banks found
								</Text>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</LinearGradient>
	);
}
