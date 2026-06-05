import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { IsPublic } from "src/shared/decorators/auth.decorators";
import { AuthService } from "./auth.service";
import { CheckEmailDto, CheckUsernameDto, CompleteProfileDto, ForgotPasswordDto, GoogleAuthDto, LoginDto, ResendEmailOtpDto, ResetPasswordDto, StartSignupDto, VerifyEmailOtpDto, VerifyResetOtpDto } from "./dto/auth.dto";
import { CustomThrottlerGuard } from "./guards/auth-throttler.guard";

@ApiTags("Auth")
@Controller("auth")
@UseGuards(CustomThrottlerGuard)
@Throttle({ authLimit: { limit: 10, ttl: 60000 } })
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Post("check-email")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Check whether an email exists" })
	@ApiBody({ type: CheckEmailDto, examples: { checkEmail: { value: { email: "user@example.com" } } } })
	@IsPublic()
	async checkEmail(@Body() dto: CheckEmailDto) {
		return await this.auth.checkExistingEmail(dto.email);
	}

	@Post("check-username")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Check whether a username exists" })
	@ApiBody({ type: CheckUsernameDto, examples: { checkUsername: { value: { username: "john_doe" } } } })
	@IsPublic()
	async checkUsername(@Body() dto: CheckUsernameDto) {
		return await this.auth.checkExistingUsername(dto.username);
	}

	@Post("signup")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Start account creation and send email OTP" })
	@ApiBody({ type: StartSignupDto })
	@IsPublic()
	async signup(@Body() dto: StartSignupDto) {
		return await this.auth.startSignup(dto);
	}

	@Post("verify-email-otp")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify account email OTP" })
	@ApiBody({ type: VerifyEmailOtpDto })
	@IsPublic()
	async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
		return await this.auth.verifyEmailOtp(dto);
	}

	@Post("resend-email-otp")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Resend account email OTP" })
	@ApiBody({ type: ResendEmailOtpDto })
	@IsPublic()
	async resendEmailOtp(@Body() dto: ResendEmailOtpDto) {
		return await this.auth.resendEmailOtp(dto.email);
	}

	@Post("complete-profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Complete profile after email verification" })
	@ApiBody({ type: CompleteProfileDto })
	@IsPublic()
	async completeProfile(@Body() dto: CompleteProfileDto) {
		return await this.auth.completeProfile(dto);
	}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login with email and password" })
	@ApiBody({ type: LoginDto, examples: { login: { value: { email: "user@example.com", password: "Password123!" } } } })
	@IsPublic()
	async login(@Body() dto: LoginDto) {
		return await this.auth.login(dto.email, dto.password);
	}

	@Post("google")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Authenticate with Google ID token" })
	@ApiBody({ type: GoogleAuthDto })
	@IsPublic()
	async google(@Body() dto: GoogleAuthDto) {
		return await this.auth.googleAuth(dto.idToken);
	}

	@Post("forgot-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Request a password reset token" })
	@ApiBody({ type: ForgotPasswordDto, examples: { forgotPassword: { value: { email: "user@example.com" } } } })
	@IsPublic()
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		return await this.auth.forgotPassword(dto.email);
	}

	@Post("reset-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Reset password with a reset token" })
	@ApiBody({ type: ResetPasswordDto, examples: { resetPassword: { value: { token: "reset-token", password: "NewPassword123!" } } } })
	@IsPublic()
	async resetPassword(@Body() dto: ResetPasswordDto) {
		return await this.auth.resetPassword(dto.token, dto.password);
	}

	@Post("verify-reset-otp")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify password reset OTP" })
	@ApiBody({ type: VerifyResetOtpDto })
	@IsPublic()
	async verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
		return await this.auth.verifyResetOtp(dto.email, dto.otp);
	}
}
