export type User = {
	_id: string;
	email: string;
	firstName: string;
	lastName: string;
	userName?: string;
	profileImage?: string;
	bio?: string;
	bankName?: string;
	accountNumber?: string;
	isEmailVerified?: boolean;
	createdAt?: string;
	updatedAt?: string;
};
