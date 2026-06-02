import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Appearance } from "react-native";
import { lightTheme, darkTheme } from "@/constants/theme";
import { ThemeState } from "@/interfaces/store.interface";
import { secureStorage } from "@/lib/config/secure-storage";

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			isDark: Appearance.getColorScheme() === "dark",
			theme: Appearance.getColorScheme() === "dark" ? darkTheme : lightTheme,

			toggleTheme: () =>
				set((state) => {
					const newIsDark = !state.isDark;
					Appearance.setColorScheme(newIsDark ? "dark" : "light");
					return {
						isDark: newIsDark,
						theme: newIsDark ? darkTheme : lightTheme,
					};
				}),
		}),
		{
			name: "theme-storage",
			storage: createJSONStorage(() => secureStorage),
		},
	),
);
