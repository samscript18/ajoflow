import { z } from "zod";

export const envSchema = z
	.object({
		NODE_ENV: z.string().default("development"),
		PORT: z.coerce.number().default(3000),
		MONGODB_URI: z.string().optional(),
		JWT_SECRET: z.string().optional(),
		JWT_ACCESS_SECRET: z.string().optional(),
		JWT_REFRESH_SECRET: z.string().optional(),
		JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
		JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
		FRONTEND_URL: z.string().optional(),
		ALLOWED_ORIGINS: z.string().optional(),
		MAILER_SERVICE: z.string().optional(),
		MAILER_USER: z.string().optional(),
		MAILER_PASS: z.string().optional(),
		MAILER_FROM_EMAIL: z.string().optional(),
		CLOUDINARY_CLOUD_NAME: z.string().optional(),
		CLOUDINARY_API_KEY: z.string().optional(),
		CLOUDINARY_API_SECRET: z.string().optional(),
		MASTER_ENCRYPTION_KEY: z.string().optional(),
		GOOGLE_WEB_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		PAYSTACK_SECRET_KEY: z.string().optional(),
	})
	.superRefine((env, ctx) => {
		if (env.NODE_ENV === "production") {
			if (!env.MONGODB_URI) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "MONGODB_URI is required in production" });
			}
			if (!env.JWT_ACCESS_SECRET && !env.JWT_SECRET) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "JWT_ACCESS_SECRET or JWT_SECRET is required in production" });
			}
			if (!env.JWT_REFRESH_SECRET) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "JWT_REFRESH_SECRET is required in production" });
			}
			if (!env.ALLOWED_ORIGINS) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ALLOWED_ORIGINS is required in production" });
			}
			if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
				ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cloudinary credentials are required in production" });
			}
		}

		const mailerValues = [env.MAILER_SERVICE, env.MAILER_USER, env.MAILER_PASS].filter(Boolean);
		if (mailerValues.length > 0 && mailerValues.length < 3) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "MAILER_SERVICE, MAILER_USER, and MAILER_PASS must be provided together" });
		}

		const cloudinaryValues = [env.CLOUDINARY_CLOUD_NAME, env.CLOUDINARY_API_KEY, env.CLOUDINARY_API_SECRET].filter(Boolean);
		if (cloudinaryValues.length > 0 && cloudinaryValues.length < 3) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be provided together" });
		}

	});
