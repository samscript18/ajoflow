import { ProfileInputProps } from "@/interfaces/ui.interface";
import { useThemeStore } from "@/store/useThemeStore";
import { Text, TextInput, View } from "react-native";

export default function ProfileInput({ label, value, placeholder, onChangeText, onBlur, autoCapitalize = "words", keyboardType = "default", rightElement }: ProfileInputProps) {
	const { theme } = useThemeStore();

	return (
		<View className="mt-6">
			<Text className="font-manrope mb-2 text-xs font-extrabold" style={{ color: theme.colors.textSecondary }}>
				{label}
			</Text>
			<View
				className="h-[58px] flex-row items-center rounded-2xl px-5"
				style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.inputBorder }}
			>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					onBlur={onBlur}
					placeholder={placeholder}
					placeholderTextColor={theme.colors.textMuted}
					autoCapitalize={autoCapitalize}
					keyboardType={keyboardType}
					className="flex-1 font-manrope text-base"
					style={{ color: theme.colors.textPrimary }}
				/>
				{rightElement}
			</View>
		</View>
	);
}
