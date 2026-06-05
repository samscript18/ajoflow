import { z } from "zod";

export const passwordValidation = z
	.string("Enter a valid password")
	.min(8, "Password must be at least 8 characters")
	.max(64, "Password is too long")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const emailSchema = z.object({
	email: z.email("Enter a valid email address").trim().toLowerCase(),
});

export const loginSchema = z.object({
	email: z.email("Enter a valid email address").trim().toLowerCase(),
	password: z.string("Enter your password").min(1, "Enter your password"),
});

export const authEntrySchema = z.object({
	email: z.email("Enter a valid email address").trim().toLowerCase(),
	password: z.string().optional(),
});

export const signupSchema = z.object({
	firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
	lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
	userName: z
		.string()
		.trim()
		.min(4, "Username must be at least 4 characters")
		.max(24, "Username is too long")
		.regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
	email: z.email("Enter a valid email address").trim().toLowerCase(),
	password: passwordValidation,
	profileImage: z.string().min(1, "Profile image is invalid").optional(),
	bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});

export const forgotPasswordSchema = emailSchema;

export const resetPasswordSchema = z
	.object({
		password: passwordValidation,
		confirmPassword: z.string("Confirm your password").min(1, "Confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const otpSchema = z.object({
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const forgotPasswordOtpSchema = z.object({
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit reset code"),
});

export const profileSchema = z.object({
	fullName: z.string().trim().min(2, "Enter your full name"),
	userName: signupSchema.shape.userName,
	bankName: z.string().trim().optional(),
	accountNumber: z
		.string()
		.trim()
		.regex(/^\d{10}$/, "Account number must be 10 digits")
		.optional()
		.or(z.literal("")),
});

export const googleAuthSchema = z.object({
	idToken: z.string().min(1, "Google ID token is required"),
});

export type EmailForm = z.infer<typeof emailSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type AuthEntryForm = z.infer<typeof authEntrySchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type ForgotPasswordOtpForm = z.infer<typeof forgotPasswordOtpSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
