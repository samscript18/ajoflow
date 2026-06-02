export type ThemeMode = "light" | "dark";

export type AppTheme = {
	mode: ThemeMode;
	colors: {
		background: string;
		surface: string;
		surfaceMuted: string;
		accentSurface: string;
		textPrimary: string;
		textSecondary: string;
		textMuted: string;
		primary: string;
		onPrimary: string;
		border: string;
		inputBorder: string;
		inputFocusBackground: string;
		buttonDisabled: string;
		error: string;
		divider: string;
		googleBrand: string;
		dot: string;
	};
};

export const lightTheme: AppTheme = {
	mode: "light",
	colors: {
		background: "#F7F7FA",
		surface: "#FFFFFF",
		surfaceMuted: "#F6F6F6",
		accentSurface: "#F5F3FF",
		textPrimary: "#161719",
		textSecondary: "#6B7280",
		textMuted: "#8A8F9C",
		primary: "#7F3DFF",
		onPrimary: "#FFFFFF",
		border: "#E5E7EB",
		inputBorder: "#E5E7EB",
		inputFocusBackground: "#F5F3FF",
		buttonDisabled: "#D7D8DE",
		error: "#EF4444",
		divider: "#F3F4F6",
		googleBrand: "#EA4335",
		dot: "#EEEEEE",
	},
};

export const darkTheme: AppTheme = {
	mode: "dark",
	colors: {
		background: "#0E0F13",
		surface: "#181B23",
		surfaceMuted: "#141821",
		accentSurface: "#1E2430",
		textPrimary: "#F4F5F7",
		textSecondary: "#B8BCC8",
		textMuted: "#8A8F9C",
		primary: "#9B6BFF",
		onPrimary: "#FFFFFF",
		border: "#2A2D38",
		inputBorder: "#3A3F4C",
		inputFocusBackground: "#2B1E4B",
		buttonDisabled: "#3F4452",
		error: "#F87171",
		divider: "#FEE2E2",
		googleBrand: "#EA4335",
		dot: "#2A2D38",
	},
};

export const getThemeByMode = (mode: ThemeMode): AppTheme => {
	return mode === "dark" ? darkTheme : lightTheme;
};
