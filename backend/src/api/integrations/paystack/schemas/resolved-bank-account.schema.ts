import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum BankAccountResolutionProvider {
	paystack = "paystack",
}

@Schema({ timestamps: true })
export class ResolvedBankAccount {
	@Prop({ required: true, trim: true, index: true })
	accountNumber: string;

	@Prop({ required: true, trim: true, index: true })
	bankCode: string;

	@Prop({ required: true, trim: true })
	accountName: string;

	@Prop({ type: String, enum: Object.values(BankAccountResolutionProvider), default: BankAccountResolutionProvider.paystack })
	provider: BankAccountResolutionProvider;

	@Prop({ required: true, default: Date.now })
	resolvedAt: Date;

	createdAt?: Date;

	updatedAt?: Date;
}

export const ResolvedBankAccountSchema = SchemaFactory.createForClass(ResolvedBankAccount);
ResolvedBankAccountSchema.index({ accountNumber: 1, bankCode: 1 }, { unique: true });

export type ResolvedBankAccountDocument = HydratedDocument<ResolvedBankAccount>;
