import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FALLBACK_NIGERIAN_BANKS } from "./banks";
import { PaystackBank, PaystackProvider } from "./paystack.provider";
import { BankAccountResolutionProvider, ResolvedBankAccount, ResolvedBankAccountDocument } from "./schemas/resolved-bank-account.schema";

type BankOption = {
	name: string;
	code: string;
	logo?: string;
};

type ResolvedBankAccountResponse = {
	accountNumber: string;
	accountName: string;
};

@Injectable()
export class PaystackService {
	private readonly logger = new Logger(PaystackService.name);

	constructor(
		private readonly config: ConfigService,
		private readonly paystackProvider: PaystackProvider,
		@InjectModel(ResolvedBankAccount.name) private readonly resolvedBankAccounts: Model<ResolvedBankAccountDocument>,
	) {}

	async listBanks(): Promise<{ banks: BankOption[] }> {
		if (!this.paystackProvider.hasClient()) {
			return { banks: FALLBACK_NIGERIAN_BANKS };
		}

		try {
			const response = await this.paystackProvider.listBanks();
			const banks = this.normalizeBanks(response.data);

			return {
				banks: banks.length > 0 ? banks : FALLBACK_NIGERIAN_BANKS,
			};
		} catch (error) {
			this.logger.warn(`Unable to fetch Paystack banks: ${this.getErrorMessage(error)}`);

			return { banks: FALLBACK_NIGERIAN_BANKS };
		}
	}

	async resolveBankAccount(accountNumber: string, bankCode: string): Promise<ResolvedBankAccountResponse> {
		const normalizedAccountNumber = accountNumber.trim();
		const normalizedBankCode = bankCode.trim();

		this.validateBankResolutionInput(normalizedAccountNumber, normalizedBankCode);

		const cachedAccount = await this.findCachedAccount(normalizedAccountNumber, normalizedBankCode);
		if (cachedAccount) {
			this.logger.log(`Using cached Paystack bank account resolution for ${normalizedBankCode}:${normalizedAccountNumber}`);

			return {
				accountNumber: cachedAccount.accountNumber,
				accountName: cachedAccount.accountName,
			};
		}

		try {
			const response = await this.paystackProvider.resolveBankAccount(normalizedAccountNumber, normalizedBankCode);

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
			const message = this.getErrorMessage(error) ?? "Unable to resolve account number";
			this.logger.warn(`Paystack account resolution failed for ${normalizedBankCode}:${normalizedAccountNumber}: ${message}`);

			if (!this.isProduction() && this.isTestModeResolutionFailure(error)) {
				this.logger.warn(`Using development mock bank account resolution for ${normalizedBankCode}:${normalizedAccountNumber}`);

				return {
					accountNumber: normalizedAccountNumber,
					accountName: "Test Account",
				};
			}

			throw new BadRequestException(message);
		}
	}

	private validateBankResolutionInput(accountNumber: string, bankCode: string) {
		if (!/^\d{10}$/.test(accountNumber)) {
			throw new BadRequestException("Account number must be exactly 10 digits");
		}

		if (!bankCode) {
			throw new BadRequestException("Bank code is required");
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

	private isProduction(): boolean {
		return this.config.get<string>("NODE_ENV") === "production";
	}

	private isTestModeResolutionFailure(error: unknown): boolean {
		const message = this.getErrorMessage(error)?.toLowerCase() ?? "";
		const statusCode = this.getErrorStatusCode(error);

		return statusCode === 429 || message.includes("rate") || message.includes("limit") || message.includes("test");
	}

	private getErrorStatusCode(error: unknown): number | undefined {
		if (error && typeof error === "object") {
			const maybeError = error as {
				status?: number;
				response?: {
					status?: number;
				};
			};

			return maybeError.response?.status ?? maybeError.status;
		}

		return undefined;
	}

	private getErrorMessage(error: unknown): string | undefined {
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

		if (error && typeof error === "object") {
			const maybeError = error as {
				message?: string;
				response?: {
					data?: {
						message?: string;
					};
				};
			};

			return maybeError.response?.data?.message ?? maybeError.message;
		}

		return undefined;
	}
}
