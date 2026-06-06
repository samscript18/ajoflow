import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsPublic } from "src/shared/decorators/auth.decorators";
import { ResolveBankAccountDto } from "./dto/paystack.dto";
import { PaystackService } from "./paystack.service";

@ApiTags("Paystack")
@Controller("paystack")
export class PaystackController {
	constructor(private readonly paystack: PaystackService) {}

	@Get("banks")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "List Nigerian banks for account verification" })
	@IsPublic()
	async listBanks() {
		return await this.paystack.listBanks();
	}

	@Post("resolve-bank-account")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Resolve a Nigerian bank account number" })
	@ApiBody({ type: ResolveBankAccountDto })
	@IsPublic()
	async resolveBankAccount(@Body() dto: ResolveBankAccountDto) {
		return await this.paystack.resolveBankAccount(dto.accountNumber, dto.bankCode);
	}
}
