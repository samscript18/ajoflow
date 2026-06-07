export type BankOption = {
	name: string;
	code: string;
	logo?: string;
};

export type ResolvedBankAccountResponse = {
	accountNumber: string;
	accountName: string;
};
