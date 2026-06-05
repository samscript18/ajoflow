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
		gold: string;
		coral: string;
		warm: string;
		cardShadow: string;
		success: string;
	};
	gradients: {
		primary: readonly [string, string, string];
		darkBackground: readonly [string, string, string];
		lightBackground: readonly [string, string, string];
	};
};
