import { Matches } from "class-validator";
import { IsString } from "src/shared/decorators";

export class ResolveBankAccountDto {
	@IsString(false)
	@Matches(/^\d{10}$/, { message: "Account number must be 10 digits" })
	accountNumber: string;

	@IsString(false)
	bankCode: string;
}
