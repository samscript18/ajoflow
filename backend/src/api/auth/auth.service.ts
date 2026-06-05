import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { createHmac } from "crypto";
import { MailService } from "src/shared/mail/mail.service";
import { UtilsService } from "src/shared/services/utils.service";
import { CompleteProfileDto, RegisterDto, StartSignupDto, VerifyEmailOtpDto } from "./dto/auth.dto";
import { User, UserDocument } from "./schemas/user.schema";

type GoogleTokenInfo = {
	aud?: string;
	sub?: string;
	email?: string;
	given_name?: string;
	family_name?: string;
	name?: string;
	picture?: string;
	error_description?: string;
};

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		@InjectModel(User.name) private readonly users: Model<UserDocument>,
		private readonly utils: UtilsService,
		private readonly config: ConfigService,
		private readonly mail: MailService,
	) {}

	async checkExistingEmail(email: string) {
		const user = await this.users.findOne({ email: email.toLowerCase() }).select("isEmailVerified");
		return { exists: Boolean(user?.isEmailVerified) };
	}

	async checkExistingUsername(username: string) {
		const normalized = username.toLowerCase();
		const exists = Boolean(await this.users.exists({ userName: normalized }));
		return { exists, suggestions: exists ? await this.suggestUsernames(normalized) : [] };
	}

	async register(data: RegisterDto) {
		const email = data.email.toLowerCase();
		const userName = data.userName.toLowerCase();

		if (await this.users.exists({ email })) throw new ConflictException("Account already exists");
		if (await this.users.exists({ userName })) throw new ConflictException("Username already exists");

		const user = await this.users.create({
			email,
			userName,
			firstName: data.firstName,
			lastName: data.lastName,
			password: await this.utils.hashPassword(data.password),
			profileImage: data.profileImage,
			bio: data.bio,
		});

		return { user: this.safeUser(user), token: this.signToken(user) };
	}

	async startSignup(data: StartSignupDto) {
		const email = data.email.toLowerCase();
		const existingUser = await this.users.findOne({ email });

		if (existingUser?.isEmailVerified) throw new ConflictException("Account already exists");

		const otp = this.generateOtp();
		const payload = {
			email,
			password: await this.utils.hashPassword(data.password),
			isEmailVerified: false,
			emailOtp: this.utils.hash(otp),
			emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
		};

		const user = existingUser ? await this.users.findByIdAndUpdate(existingUser._id, payload, { new: true }) : await this.users.create(payload);
		if (!user) throw new BadRequestException("Unable to start signup");

		await this.sendEmailOtp(user, otp);
		return { success: true, message: "Verification code sent to email" };
	}

	async verifyEmailOtp(data: VerifyEmailOtpDto) {
		const user = await this.users.findOne({ email: data.email.toLowerCase() });
		if (!user || !user.emailOtp || !user.emailOtpExpires) throw new BadRequestException("Invalid verification request");
		if (user.emailOtpExpires.getTime() <= Date.now()) throw new BadRequestException("Verification code has expired");
		if (user.emailOtp !== this.utils.hash(data.otp)) throw new BadRequestException("Invalid verification code");

		user.isEmailVerified = true;
		user.emailOtp = undefined;
		user.emailOtpExpires = undefined;
		await user.save();

		return { user: this.safeUser(user), token: this.signToken(user) };
	}

	async resendEmailOtp(email: string) {
		const user = await this.users.findOne({ email: email.toLowerCase() });
		if (!user) throw new BadRequestException("Account not found");
		if (user.isEmailVerified) return { success: true, message: "Email already verified" };

		const otp = this.generateOtp();
		user.emailOtp = this.utils.hash(otp);
		user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
		await user.save();
		await this.sendEmailOtp(user, otp);
		return { success: true, message: "Verification code resent" };
	}

	async completeProfile(data: CompleteProfileDto) {
		const email = data.email.toLowerCase();
		const userName = data.userName.toLowerCase();
		const user = await this.users.findOne({ email });

		if (!user) throw new BadRequestException("Account not found");
		if (!user.isEmailVerified) throw new BadRequestException("Email verification required");

		const existingUsername = await this.users.findOne({ userName, _id: { $ne: user._id } });
		if (existingUsername) throw new ConflictException("Username already exists");

		user.firstName = data.firstName;
		user.lastName = data.lastName;
		user.userName = userName;
		user.profileImage = data.profileImage;
		user.bio = data.bio;
		user.bankName = data.bankName;
		user.accountNumber = data.accountNumber;
		await user.save();

		return { user: this.safeUser(user), token: this.signToken(user) };
	}

	async login(email: string, password: string) {
		const user = await this.users.findOne({ email: email.toLowerCase() });
		if (!user?.password) throw new UnauthorizedException("Invalid Credentials");
		if (!user.isEmailVerified) throw new UnauthorizedException("Verify your email before logging in");

		if (user.loginBlockedUntil && user.loginBlockedUntil > new Date()) {
			throw new BadRequestException("Account temporarily locked. Try later.");
		}

		const { isValid } = await this.utils.comparePasswords(password, user.password);
		if (!isValid) {
			user.loginAttempts = (user.loginAttempts ?? 0) + 1;
			if (user.loginAttempts >= 5) {
				user.loginBlockedUntil = new Date(Date.now() + 10 * 60 * 1000);
				user.loginAttempts = 0;
			}
			await user.save();
			throw new UnauthorizedException("Invalid Credentials");
		}

		user.loginAttempts = 0;
		user.loginBlockedUntil = undefined;
		await user.save();
		return { user: this.safeUser(user), token: this.signToken(user) };
	}

	async googleAuth(idToken: string) {
		const tokenInfo = await this.verifyGoogleToken(idToken);
		if (!tokenInfo.email || !tokenInfo.sub) throw new BadRequestException("Google account has no email");

		let user = await this.users.findOne({ email: tokenInfo.email.toLowerCase() });
		if (user?.password && !user.googleId) throw new BadRequestException("Please log in with email and password");

		if (!user) {
			const firstName = tokenInfo.given_name ?? tokenInfo.name?.split(" ")[0] ?? "";
			const lastName = tokenInfo.family_name ?? tokenInfo.name?.split(" ").slice(1).join(" ") ?? "User";
			user = await this.users.create({
				email: tokenInfo.email.toLowerCase(),
				firstName,
				lastName,
				userName: await this.uniqueUsername(tokenInfo.email, tokenInfo.name ?? firstName),
				googleId: tokenInfo.sub,
				profileImage: tokenInfo.picture,
			});
		} else if (!user.googleId) {
			user.googleId = tokenInfo.sub;
			await user.save();
		}

		return { user: this.safeUser(user), token: this.signToken(user) };
	}

	async forgotPassword(email: string) {
		const user = await this.users.findOne({ email: email.toLowerCase() });
		if (!user) return { success: true, message: "Password reset code has been sent to email" };

		const token = this.generateOtp();
		user.resetPasswordToken = this.utils.hash(token);
		user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
		await user.save();

		await this.sendResetEmail(user, token);
		return { success: true, message: "Password reset code has been sent to email" };
	}

	async verifyResetOtp(email: string, otp: string) {
		const user = await this.users.findOne({ email: email.toLowerCase() });
		if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
			throw new BadRequestException("Invalid verification request");
		}
		if (user.resetPasswordExpires.getTime() <= Date.now()) throw new BadRequestException("Reset code has expired");
		if (user.resetPasswordToken !== this.utils.hash(otp)) throw new BadRequestException("Invalid reset code");

		return { success: true, message: "Reset code verified" };
	}

	async resetPassword(token: string, password: string) {
		const hashedToken = this.utils.hash(token);
		const user = await this.users.findOne({ resetPasswordToken: hashedToken });
		if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() <= Date.now()) {
			throw new BadRequestException("Invalid or expired token");
		}

		user.password = await this.utils.hashPassword(password);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();
		return { success: true, message: "Password reset successful" };
	}

	private async verifyGoogleToken(idToken: string): Promise<GoogleTokenInfo> {
		const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
		const tokenInfo = (await response.json()) as GoogleTokenInfo;
		if (!response.ok) throw new BadRequestException(tokenInfo.error_description ?? "Google authentication failed");

		const expectedAudience = this.config.get<string>("GOOGLE_WEB_CLIENT_ID") || this.config.get<string>("GOOGLE_CLIENT_ID");
		if (expectedAudience && tokenInfo.aud !== expectedAudience) {
			throw new BadRequestException("Invalid Google token audience");
		}

		return tokenInfo;
	}

	private async sendResetEmail(user: UserDocument, token: string) {
		try {
			const subject = "Reset your AjoFlow password";
			const html = `<p>Hello ${user.firstName || "there"},</p><p>We received a request to reset your AjoFlow password.</p><p>Your reset code is:</p><h2>${token}</h2><p>This code expires in 10 minutes.</p>`;
			await this.mail.sendMail({ to: user.email, subject, html });
		} catch (error) {
			this.logger.warn(`Password reset email failed: ${user.email}`);
		}
	}

	private async sendEmailOtp(user: UserDocument, otp: string) {
		try {
			const subject = "Verify your AjoFlow email";
			const html = `<p>Hello,</p><p>Your AjoFlow verification code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`;
			await this.mail.sendMail({ to: user.email, subject, html });
		} catch (error) {
			this.logger.warn(`Email verification OTP failed: ${user.email}`);
		}
	}

	private generateOtp() {
		return `${Math.floor(100000 + Math.random() * 900000)}`;
	}

	private async uniqueUsername(email: string, name: string) {
		const base = this.utils.slug(name || email.split("@")[0] || "user").replace(/-/g, "_") || "user";
		let candidate = base.slice(0, 20);
		let attempt = 0;

		while (await this.users.exists({ userName: candidate })) {
			attempt += 1;
			candidate = `${base.slice(0, 18)}_${attempt}`;
		}

		return candidate;
	}

	private async suggestUsernames(username: string) {
		const base = username.replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "") || "user";
		const suggestions: string[] = [];
		let attempt = 0;

		while (suggestions.length < 3 && attempt < 50) {
			attempt += 1;
			const suffix = attempt < 10 ? `0${attempt}` : `${attempt}`;
			const candidate = `${base.slice(0, 20)}_${suffix}`;
			const exists = await this.users.exists({ userName: candidate });

			if (!exists && !suggestions.includes(candidate)) {
				suggestions.push(candidate);
			}
		}

		return suggestions;
	}

	private signToken(user: UserDocument) {
		const secret = this.config.get<string>("JWT_ACCESS_SECRET") || this.config.get<string>("JWT_SECRET") || "development-secret";
		const header = this.base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
		const payload = this.base64Url(JSON.stringify({ sub: user._id.toString(), email: user.email, iat: Math.floor(Date.now() / 1000) }));
		const signature = this.base64Url(createHmac("sha256", secret).update(`${header}.${payload}`).digest());
		return `${header}.${payload}.${signature}`;
	}

	private base64Url(value: string | Buffer) {
		return Buffer.from(value).toString("base64url");
	}

	private safeUser(user: UserDocument) {
		return {
			_id: user._id.toString(),
			id: user._id.toString(),
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			userName: user.userName,
			profileImage: user.profileImage,
			bio: user.bio,
			bankName: user.bankName,
			accountNumber: user.accountNumber,
			isEmailVerified: user.isEmailVerified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
