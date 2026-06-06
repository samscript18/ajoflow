import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState } from "@/interfaces/store.interface";
import { secureStorage } from "@/lib/config/secure-storage";

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			hasCompletedOnboarding: false,
			setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
			isAuthenticated: false,
			setIsAuthenticated: (value) => set({ isAuthenticated: value }),
			accessToken: "",
			setAccessToken: (token) => set({ accessToken: token }),
			registrationStep: 1,
			setRegistrationStep: (step) => set({ registrationStep: step }),
			registrationData: {
				email: "",
				password: "",
				firstName: "",
				lastName: "",
				userName: "",
			},
			setRegistrationData: (data) => set({ registrationData: { ...get().registrationData, ...data } }),
			forgotPasswordToken: "",
			setForgotPasswordToken: (token) => set({ forgotPasswordToken: token }),
			passwordResetStep: 0,
			setPasswordResetStep: (step) => set({ passwordResetStep: step }),
			logout: async () => {
				set((state) => ({ ...state, accessToken: "", isAuthenticated: false, user: null, passwordResetStep: 0 }));
			},
			user: null,
			setUser: (user) => set({ user }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => secureStorage),
		},
	),
);
