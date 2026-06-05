import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Appearance } from "react-native";
import { lightTheme, darkTheme } from "@/constants/theme";
import { ThemeState } from "@/interfaces/store.interface";
import { secureStorage } from "@/lib/config/secure-storage";

const getThemeForMode = (isDark: boolean) => (isDark ? darkTheme : lightTheme);

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			isDark: Appearance.getColorScheme() === "dark",
			theme: getThemeForMode(Appearance.getColorScheme() === "dark"),

			toggleTheme: () =>
				set((state) => {
					const newIsDark = !state.isDark;
					Appearance.setColorScheme(newIsDark ? "dark" : "light");
					return {
						isDark: newIsDark,
						theme: getThemeForMode(newIsDark),
					};
				}),
		}),
		{
			name: "themeStorage",
			storage: createJSONStorage(() => secureStorage),
			merge: (persistedState, currentState) => {
				const persisted = persistedState as Partial<ThemeState> | undefined;
				const isDark = persisted?.isDark ?? currentState.isDark;

				return {
					...currentState,
					isDark,
					theme: getThemeForMode(isDark),
				};
			},
		},
	),
);
