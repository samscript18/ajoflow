import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PaystackController } from "./paystack/paystack.controller";
import { PaystackProvider } from "./paystack/paystack.provider";
import { PaystackService } from "./paystack/paystack.service";
import { ResolvedBankAccount, ResolvedBankAccountSchema } from "./paystack/schemas/resolved-bank-account.schema";

@Module({
	imports: [MongooseModule.forFeature([{ name: ResolvedBankAccount.name, schema: ResolvedBankAccountSchema }])],
	controllers: [PaystackController],
	providers: [PaystackService, PaystackProvider],
	exports: [PaystackService, PaystackProvider],
})
export class IntegrationsModule {}
