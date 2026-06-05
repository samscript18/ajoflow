import { User } from "@/types/user/user";
import { RegistrationDto } from "./auth.interface";
import { AppTheme } from "@/types/theme/theme";

export interface AuthState {
	registrationData: RegistrationDto;
	setRegistrationData: (data: Partial<RegistrationDto>) => void;
	accessToken: string | null;
	setAccessToken: (token: string | null) => void;
	registrationStep: number;
	setRegistrationStep: (step: number) => void;
	hasCompletedOnboarding: boolean;
	setHasCompletedOnboarding: (value: boolean) => void;
	isAuthenticated: boolean;
	setIsAuthenticated: (value: boolean) => void;
	forgotPasswordToken: string;
	setForgotPasswordToken: (token: string) => void;
	passwordResetStep: number;
	setPasswordResetStep: (step: number) => void;
	logout: () => Promise<void>;
	user: User | null;
	setUser: (user: User | null) => void;
}

export interface ThemeState {
	isDark: boolean;
	theme: AppTheme;
	toggleTheme: () => void;
}
