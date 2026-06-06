import { BankSelectProps } from "@/interfaces/ui.interface";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function BankSelect({ label, value, placeholder, onPress }: BankSelectProps) {
	const { theme } = useThemeStore();

	return (
		<View className="mt-6">
			<Text className="font-manrope mb-2 text-xs font-extrabold" style={{ color: theme.colors.textSecondary }}>
				{label}
			</Text>
			<TouchableOpacity
				onPress={onPress}
				className="h-[58px] flex-row items-center justify-between rounded-2xl px-5"
				style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.inputBorder }}
			>
				<Text className="font-manrope text-base" style={{ color: value ? theme.colors.textPrimary : theme.colors.textMuted }}>
					{value || placeholder}
				</Text>
				<Ionicons name="chevron-down" size={19} color={theme.colors.textSecondary} />
			</TouchableOpacity>
		</View>
	);
}
