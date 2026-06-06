export type Bank = {
	name: string;
	code: string;
	logo?: string;
};

export type ResolveBankAccountRequest = {
	accountNumber: string;
	bankCode: string;
};

export type BankAccountResolution = {
	accountNumber: string;
	accountName: string;
};
