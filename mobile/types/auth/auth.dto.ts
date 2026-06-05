import { User } from "@/types/user/user";

export type CheckEmailDto = {
	email: string;
};

export type CheckUsernameDto = {
	username: string;
};

export type LoginDto = {
	email: string;
	password: string;
};

export type StartSignupDto = {
	email: string;
	password: string;
};

export type VerifyEmailOtpDto = {
	email: string;
	otp: string;
};

export type ResendEmailOtpDto = {
	email: string;
};

export type CompleteProfileDto = {
	email: string;
	firstName: string;
	lastName: string;
	userName: string;
	profileImage?: string;
	bio?: string;
	bankName?: string;
	accountNumber?: string;
};

export type GoogleAuthDto = {
	idToken: string;
};

export type ForgotPasswordDto = {
	email: string;
};

export type ResetPasswordDto = {
	token: string;
	password: string;
};

export type VerifyResetOtpDto = {
	email: string;
	otp: string;
};

export type AuthPayload = {
	user: User;
	token: string;
};

export type MessagePayload = {
	success: boolean;
	message: string;
};
