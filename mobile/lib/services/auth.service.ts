import { ApiResponse } from "@/types/api";
import { AuthPayload, CheckEmailDto, CheckUsernameDto, CompleteProfileDto, ForgotPasswordDto, GoogleAuthDto, LoginDto, MessagePayload, ResendEmailOtpDto, ResetPasswordDto, StartSignupDto, VerifyEmailOtpDto, VerifyResetOtpDto } from "@/types/auth/auth.dto";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { publicApi } from "../config/axios-instance";
import { signInWithGoogle } from "../config/google";

export const checkEmail = async (data: CheckEmailDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ exists: boolean }>>("/auth/check-email", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const checkUsername = async (data: CheckUsernameDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ exists: boolean; suggestions: string[] }>>("/auth/check-username", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const login = async (data: LoginDto) => {
	try {
		const response = await publicApi.post<ApiResponse<AuthPayload>>("/auth/login", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const signup = async (data: StartSignupDto) => {
	try {
		const response = await publicApi.post<ApiResponse<MessagePayload>>("/auth/signup", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const verifyEmailOtp = async (data: VerifyEmailOtpDto) => {
	try {
		const response = await publicApi.post<ApiResponse<AuthPayload>>("/auth/verify-email-otp", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const resendEmailOtp = async (data: ResendEmailOtpDto) => {
	try {
		const response = await publicApi.post<ApiResponse<MessagePayload>>("/auth/resend-email-otp", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const completeProfile = async (data: CompleteProfileDto) => {
	try {
		const response = await publicApi.post<ApiResponse<AuthPayload>>("/auth/complete-profile", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const googleAuth = async () => {
	try {
		const { idToken } = await signInWithGoogle();
		const response = await publicApi.post<ApiResponse<AuthPayload>>("/auth/google", { idToken } satisfies GoogleAuthDto);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const requestForgotPasswordToken = async (data: ForgotPasswordDto) => {
	try {
		await publicApi.post("/auth/forgot-password", data);
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const resetPassword = async (data: ResetPasswordDto) => {
	try {
		await publicApi.post("/auth/reset-password", data);
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const verifyResetOtp = async (data: VerifyResetOtpDto) => {
	try {
		const response = await publicApi.post<ApiResponse<MessagePayload>>("/auth/verify-reset-otp", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
