import { Bank } from "@/types/paystack/paystack";
import { ImageStyle, StyleProp } from "react-native";
import { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Control } from "react-hook-form";
import { ResetPasswordForm } from "@/schemas/auth.schema";

export interface LogoProps {
	size?: number;
	style?: StyleProp<ImageStyle>;
}

export interface BankSelectProps {
	label: string;
	value: string;
	placeholder: string;
	onPress: () => void;
}

export interface BankLogoProps {
	bank: Bank;
}

export interface ProfileInputProps {
	label: string;
	value: string;
	placeholder: string;
	onChangeText: (value: string) => void;
	onBlur?: () => void;
	autoCapitalize?: "none" | "sentences" | "words" | "characters";
	keyboardType?: "default" | "number-pad";
	rightElement?: ReactNode;
}

export interface AnimatedScreenProps {
	children: ReactNode;
	className?: string;
	delay?: number;
}

export interface AnimatedSectionProps {
	children: ReactNode;
	className?: string;
	delay?: number;
}

export interface GradientButtonProps {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	className?: string;
	contentClassName?: string;
	icon?: ComponentProps<typeof Ionicons>["name"];
	variant?: "primary" | "dark";
}

export interface RemoteArtworkProps {
	uri: string;
	width: number;
	height: number;
	className?: string;
	style?: StyleProp<ImageStyle>;
}

export interface AuthPasswordInputProps {
	control: Control<ResetPasswordForm>;
	name: "password" | "confirmPassword";
	label: string;
	focused: string;
	setFocused: (value: string) => void;
	show: boolean;
	setShow: (value: boolean) => void;
}
