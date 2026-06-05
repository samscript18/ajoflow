import { ImageStyle, StyleProp } from "react-native";
import { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

export interface LogoProps {
	size?: number;
	style?: StyleProp<ImageStyle>;
}

export interface ProfileInputProps {
	label: string;
	value: string;
	placeholder: string;
	onChangeText: (value: string) => void;
	onBlur?: () => void;
	autoCapitalize?: "none" | "sentences" | "words" | "characters";
	keyboardType?: "default" | "number-pad";
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
