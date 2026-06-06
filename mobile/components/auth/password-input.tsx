import { AuthPasswordInputProps } from "@/interfaces/ui.interface";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PasswordInput({ control, name, label, focused, setFocused, show, setShow }: AuthPasswordInputProps) {
	const { theme } = useThemeStore();

	return (
		<View className="mt-6">
			<Text className="font-manrope mb-2 text-xs font-extrabold uppercase tracking-[1.8px]" style={{ color: theme.colors.textMuted }}>
				{label}
			</Text>
			<Controller
				control={control}
				name={name}
				render={({ field: { value, onChange, onBlur }, fieldState }) => (
					<View
						className="h-[58px] flex-row items-center rounded-2xl px-5"
						style={{
							backgroundColor: theme.colors.surfaceMuted,
							borderWidth: 1,
							borderColor: fieldState.error ? theme.colors.error : focused === name ? theme.colors.primary : theme.colors.inputBorder,
						}}
					>
						<TextInput
							value={value}
							onChangeText={onChange}
							onFocus={() => setFocused(name)}
							onBlur={() => {
								onBlur();
								setFocused("");
							}}
							placeholder={label}
							placeholderTextColor={theme.colors.textMuted}
							secureTextEntry={!show}
							className="flex-1 font-manrope text-base font-semibold"
							style={{ color: theme.colors.textPrimary }}
						/>
						<TouchableOpacity onPress={() => setShow(!show)}>
							<Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={21} color={theme.colors.textSecondary} />
						</TouchableOpacity>
					</View>
				)}
			/>
		</View>
	);
}
