import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PAYSTACK_PROVIDER } from "./paystack.provider";
import { BankAccountResolutionProvider, ResolvedBankAccount, ResolvedBankAccountDocument } from "./schemas/resolved-bank-account.schema";
import type { BankOption, ResolvedBankAccountResponse } from "./types/paystack-service.types";
import type { PaystackBank, PaystackClient } from "./types/paystack.types";

@Injectable()
export class PaystackService {
	private readonly logger = new Logger(PaystackService.name);

	constructor(
		@Inject(PAYSTACK_PROVIDER) private readonly paystack: PaystackClient,
		@InjectModel(ResolvedBankAccount.name) private readonly resolvedBankAccounts: Model<ResolvedBankAccountDocument>,
	) {}

	async listBanks(): Promise<{ banks: BankOption[] }> {
		try {
			const response = await this.paystack.verification.fetchBanks({
				country: "nigeria",
				perPage: 100,
				use_cursor: false,
			});
			const banks = this.normalizeBanks(response.data);

			return { banks };
		} catch (error) {
			this.logger.warn(`Unable to fetch Paystack banks: ${this.getPaystackErrorMessage(error)}`);
			return { banks: [] };
		}
	}

	async resolveBankAccount(accountNumber: string, bankCode: string): Promise<ResolvedBankAccountResponse> {
		const normalizedAccountNumber = accountNumber.trim();
		const normalizedBankCode = bankCode.trim();

		const cachedAccount = await this.findCachedAccount(normalizedAccountNumber, normalizedBankCode);
		if (cachedAccount) {
			this.logger.log(`Using cached Paystack bank account resolution for ${normalizedBankCode}:${normalizedAccountNumber}`);

			return {
				accountNumber: cachedAccount.accountNumber,
				accountName: cachedAccount.accountName,
			};
		}

		try {
			const response = await this.paystack.verification.resolveAccountNumber({
				account_number: normalizedAccountNumber,
				bank_code: normalizedBankCode,
			});
			const resolved = response.data;

			if (!resolved?.account_name) {
				throw new BadRequestException(response.message ?? "Unable to resolve account number");
			}

			const result = {
				accountNumber: resolved.account_number ?? normalizedAccountNumber,
				accountName: resolved.account_name,
			};

			await this.cacheResolvedAccount(result.accountNumber, normalizedBankCode, result.accountName);

			return result;
		} catch (error) {
			const message = this.getPaystackErrorMessage(error);
			this.logger.warn(`Paystack account resolution failed for ${normalizedBankCode}:${normalizedAccountNumber}: ${message}`);
			throw new BadRequestException(message);
		}
	}

	private async findCachedAccount(accountNumber: string, bankCode: string): Promise<ResolvedBankAccountDocument | null> {
		return await this.resolvedBankAccounts.findOne({
			accountNumber,
			bankCode,
			provider: BankAccountResolutionProvider.paystack,
		});
	}

	private async cacheResolvedAccount(accountNumber: string, bankCode: string, accountName: string): Promise<void> {
		await this.resolvedBankAccounts.findOneAndUpdate(
			{
				accountNumber,
				bankCode,
				provider: BankAccountResolutionProvider.paystack,
			},
			{
				$set: {
					accountName,
					resolvedAt: new Date(),
				},
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			},
		);
	}

	private normalizeBanks(banks: PaystackBank[] = []): BankOption[] {
		return banks
			.filter((bank): bank is PaystackBank & { name: string; code: string } => {
				return Boolean(bank.name && bank.code);
			})
			.map((bank) => ({
				name: bank.name,
				code: bank.code,
				logo: bank.logo,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	private getPaystackErrorMessage(error: unknown): string {
		if (error instanceof BadRequestException) {
			const response = error.getResponse();

			if (typeof response === "string") return response;

			if (response && typeof response === "object" && "message" in response) {
				const message = response.message;

				if (Array.isArray(message)) return message.join(", ");
				if (typeof message === "string") return message;
			}

			return error.message;
		}

		const maybeError = error as {
			message?: string;
			response?: {
				data?: {
					message?: string;
				};
			};
		};

		return maybeError?.response?.data?.message ?? maybeError?.message ?? "Unable to complete Paystack request";
	}
}
