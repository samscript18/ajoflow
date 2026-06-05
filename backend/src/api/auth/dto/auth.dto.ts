import { MinLength, Matches } from "class-validator";
import { IsEmail, IsString, IsUrl } from "src/shared/decorators";

export class CheckEmailDto {
	@IsEmail(false)
	email: string;
}

export class CheckUsernameDto {
	@IsString(false)
	@MinLength(4)
	@Matches(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores" })
	username: string;
}

export class RegisterDto {
	@IsString(false)
	@MinLength(2)
	firstName: string;

	@IsString(false)
	@MinLength(2)
	lastName: string;

	@IsString(false)
	@MinLength(4)
	@Matches(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores" })
	userName: string;

	@IsEmail(false)
	email: string;

	@IsString(false)
	@MinLength(8)
	password: string;

	@IsUrl(true)
	profileImage?: string;

	@IsString(true)
	bio?: string;
}

export class StartSignupDto {
	@IsEmail(false)
	email: string;

	@IsString(false)
	@MinLength(8)
	password: string;
}

export class VerifyEmailOtpDto {
	@IsEmail(false)
	email: string;

	@IsString(false)
	@Matches(/^\d{6}$/, { message: "OTP must be 6 digits" })
	otp: string;
}

export class ResendEmailOtpDto {
	@IsEmail(false)
	email: string;
}

export class CompleteProfileDto {
	@IsEmail(false)
	email: string;

	@IsString(false)
	@MinLength(2)
	firstName: string;

	@IsString(false)
	@MinLength(2)
	lastName: string;

	@IsString(false)
	@MinLength(4)
	@Matches(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores" })
	userName: string;

	@IsUrl(true)
	profileImage?: string;

	@IsString(true)
	bio?: string;

	@IsString(true)
	bankName?: string;

	@IsString(true)
	@Matches(/^\d{10}$/, { message: "Account number must be 10 digits" })
	accountNumber?: string;
}

export class LoginDto {
	@IsEmail(false)
	email: string;

	@IsString(false)
	password: string;
}

export class GoogleAuthDto {
	@IsString(false)
	idToken: string;
}

export class ForgotPasswordDto {
	@IsEmail(false)
	email: string;
}

export class ResetPasswordDto {
	@IsString(false)
	token: string;

	@IsString(false)
	@MinLength(8)
	password: string;
}

export class VerifyResetOtpDto {
	@IsEmail(false)
	email: string;

	@IsString(false)
	@Matches(/^\d{6}$/, { message: "OTP must be 6 digits" })
	otp: string;
}
