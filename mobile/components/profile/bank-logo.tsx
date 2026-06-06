import { BankLogoProps } from "@/interfaces/ui.interface";
import { getBankLogoUrl } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";

export default function BankLogo({ bank }: BankLogoProps) {
	const { theme } = useThemeStore();
	const logoUrl = getBankLogoUrl(bank);

	if (logoUrl) {
		return <Image source={{ uri: logoUrl }} style={{ width: 28, height: 28, borderRadius: 14 }} contentFit="contain" />;
	}

	return (
		<View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.accentSurface }}>
			<Ionicons name="business" size={14} color={theme.colors.textSecondary} />
		</View>
	);
}
