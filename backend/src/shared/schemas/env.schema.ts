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
		}
	});
