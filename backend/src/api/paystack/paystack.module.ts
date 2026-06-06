import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { PaystackController } from "./paystack.controller";
import { PaystackProvider } from "./paystack.provider";
import { PaystackService } from "./paystack.service";
import { ResolvedBankAccount, ResolvedBankAccountSchema } from "./schemas/resolved-bank-account.schema";

@Module({
	imports: [ConfigModule, MongooseModule.forFeature([{ name: ResolvedBankAccount.name, schema: ResolvedBankAccountSchema }])],
	controllers: [PaystackController],
	providers: [PaystackProvider, PaystackService],
	exports: [PaystackService],
})
export class PaystackModule {}
