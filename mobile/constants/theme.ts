import { AppTheme, ThemeMode } from "@/types/theme/theme";

export const lightTheme: AppTheme = {
	mode: "light",
	colors: {
		background: "#F7F6F2",
		surface: "#FFFFFF",
		surfaceMuted: "#F4F1EC",
		accentSurface: "#F1EEE6",
		textPrimary: "#1B1B1B",
		textSecondary: "#697386",
		textMuted: "#A2A9B8",
		primary: "#E1AD2D",
		onPrimary: "#101010",
		border: "#ECE8E0",
		inputBorder: "#EFECE7",
		inputFocusBackground: "#FFF7E5",
		buttonDisabled: "#D7D8DE",
		error: "#EF4444",
		divider: "#ECEBE7",
		googleBrand: "#EA4335",
		dot: "#DDD9D1",
		gold: "#E1AD2D",
		coral: "#E77B51",
		warm: "#9B5F43",
		cardShadow: "#D7CFC0",
		success: "#3FA26B",
	},
	gradients: {
		primary: ["#E77B51", "#E1AD2D", "#E77B51"],
		darkBackground: ["#231E28", "#0B1428", "#111717"],
		lightBackground: ["#A3B18A", "#A3B18A60", "#FFFFFF"],
	},
};

export const darkTheme: AppTheme = {
	mode: "dark",
	colors: {
		background: "#0B1428",
		surface: "#151D31",
		surfaceMuted: "#101A2F",
		accentSurface: "#22283B",
		textPrimary: "#FFFFFF",
		textSecondary: "#A9B2C8",
		textMuted: "#747E96",
		primary: "#E1AD2D",
		onPrimary: "#091226",
		border: "#263049",
		inputBorder: "#29334A",
		inputFocusBackground: "#1B253D",
		buttonDisabled: "#3F4452",
		error: "#F87171",
		divider: "#273047",
		googleBrand: "#EA4335",
		dot: "#263049",
		gold: "#E1AD2D",
		coral: "#E77B51",
		warm: "#A06246",
		cardShadow: "#050A15",
		success: "#36C37D",
	},
	gradients: {
		primary: ["#E77B51", "#E1AD2D", "#E77B51"],
		darkBackground: ["#231E28", "#0B1428", "#111717"],
		lightBackground: ["#A3B18A", "#A3B18A60", "#FFFFFF"],
	},
};

export const getThemeByMode = (mode: ThemeMode): AppTheme => {
	return mode === "dark" ? darkTheme : lightTheme;
};
