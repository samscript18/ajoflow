import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TextInput, View, Text, ActivityIndicator } from "react-native";

type InputFieldProps = {
	label: string;
	value: string;
	placeholder: string;
	onChangeText: (val: string) => void;
	keyboardType?: "default" | "email-address";
	autoCapitalize?: "none" | "sentences" | "words";
	multiline?: boolean;
	lines?: number;
	focused: boolean;
	editable?: boolean;
	exists?: boolean;
	iconLoading?: boolean;
	checkIcon?: boolean;
	onFocus: () => void;
	onBlur: () => void;
};

const InputField = ({ label, value, placeholder, onChangeText, keyboardType = "default", autoCapitalize = "sentences", multiline = false, lines = 1, focused, onFocus, onBlur, editable = true, exists, iconLoading, checkIcon }: InputFieldProps) => {
	const { theme, isDark } = useThemeStore();
	const minHeight = multiline ? (Platform.OS === "ios" ? 140 : 120) : undefined;

	return (
		<View className="mb-6">
			<Text className="font-manrope mb-2 text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
				{label}
			</Text>
			<View
				className={`rounded-2xl ${multiline ? "p-4" : Platform.OS === "ios" ? "p-5" : "p-3"}`}
				style={{
					backgroundColor: theme.colors.surfaceMuted,
					borderWidth: 1,
					borderColor: focused ? theme.colors.primary : theme.colors.inputBorder,
				}}
			>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={isDark ? "#8C93A4" : theme.colors.textMuted}
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					multiline={multiline}
					textAlignVertical={multiline ? "top" : "center"}
					className="text-base"
					style={{ color: theme.colors.textPrimary, minHeight }}
					onFocus={onFocus}
					onBlur={onBlur}
					numberOfLines={lines}
					editable={editable}
				/>

				{checkIcon && (
					<View className="absolute top-5 right-5">
						{iconLoading ? (
							<ActivityIndicator size="small" color="#7F3DFF" />
						) : !exists ? (
							<Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
						) : exists ? (
							<Ionicons name="close-circle" size={24} color={theme.colors.error} />
						) : null}
					</View>
				)}
			</View>
		</View>
	);
};

export default InputField;
