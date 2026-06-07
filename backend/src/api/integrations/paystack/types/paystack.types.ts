import type Paystack from "@paystack/paystack-sdk";

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

export type PaystackVerificationApi = {
	fetchBanks(params: { country: string; perPage: number; use_cursor: boolean }): Promise<PaystackResponse<PaystackBank[]>>;

	resolveAccountNumber(params: { account_number: string; bank_code: string }): Promise<PaystackResponse<PaystackResolvedAccount>>;
};

export type PaystackClient = Paystack & {
	verification: PaystackVerificationApi;
};
