import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Paystack from "@paystack/paystack-sdk";

export type PaystackResponse<T> = {
	status?: boolean;
	message?: string;
	data?: T;
};

export type PaystackBank = {
	name?: string;
	code?: string;
	logo?: string;
};

export type PaystackResolvedAccount = {
	account_number?: string;
	account_name?: string;
	bank_id?: number;
};

type PaystackVerificationApi = {
	fetchBanks(params: { country: string; perPage: number; use_cursor: boolean }): Promise<PaystackResponse<PaystackBank[]>>;

	resolveAccountNumber(params: { account_number: string; bank_code: string }): Promise<PaystackResponse<PaystackResolvedAccount>>;
};

type PaystackClient = Paystack & {
	verification: PaystackVerificationApi;
};

@Injectable()
export class PaystackProvider {
	private readonly client: PaystackClient | null;

	constructor(private readonly config: ConfigService) {
		const secretKey = this.config.get<string>("PAYSTACK_SECRET_KEY");
		this.client = secretKey ? (new Paystack(secretKey) as PaystackClient) : null;
	}

	async listBanks(): Promise<PaystackResponse<PaystackBank[]>> {
		return await this.requireClient().verification.fetchBanks({
			country: "nigeria",
			perPage: 100,
			use_cursor: false,
		});
	}

	async resolveBankAccount(accountNumber: string, bankCode: string): Promise<PaystackResponse<PaystackResolvedAccount>> {
		return await this.requireClient().verification.resolveAccountNumber({
			account_number: accountNumber,
			bank_code: bankCode,
		});
	}

	hasClient(): boolean {
		return Boolean(this.client);
	}

	private requireClient(): PaystackClient {
		if (!this.client) {
			throw new BadRequestException("PAYSTACK_SECRET_KEY is required");
		}

		return this.client;
	}
}
