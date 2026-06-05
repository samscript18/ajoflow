import { z } from "zod";

export const passwordValidation = z
	.string({ required_error: "Enter a valid password" })
	.min(8, "Password must be at least 8 characters")
	.max(64, "Password is too long")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const emailExistenceSchema = z.object({
	email: z.string().email("Invalid email format").trim().toLowerCase(),
});

export const usernameExistenceSchema = z.object({
	username: z
		.string()
		.trim()
		.min(4, "Username must be at least 4 characters")
		.max(24, "Username is too long")
		.regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
});

export const loginSchema = z.object({
	email: z.string().email("Enter a valid email address").trim().toLowerCase(),
	password: z.string({ required_error: "Enter your password" }).min(1, "Enter your password"),
});

export const registerSchema = z.object({
	firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
	lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
	userName: usernameExistenceSchema.shape.username,
	email: z.string().email("Enter a valid email address").trim().toLowerCase(),
	password: passwordValidation,
	profileImage: z.string().url("Profile image must be a valid URL").optional(),
	bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});

export const forgotPasswordSchema = emailExistenceSchema;

export const resetPasswordSchema = z.object({
	token: z.string().trim().min(1, "Reset token is required"),
	password: passwordValidation,
});

export const googleAuthSchema = z.object({
	idToken: z.string().min(1, "Google ID token is required"),
});

export type EmailExistenceDto = z.infer<typeof emailExistenceSchema>;
export type UsernameExistenceDto = z.infer<typeof usernameExistenceSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type GoogleAuthDto = z.infer<typeof googleAuthSchema>;
