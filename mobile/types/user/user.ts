export type User = {
	_id: string;
	email: string;
	firstName: string;
	lastName: string;
	userName?: string;
	profileImage?: string;
	bio?: string;
	bankName?: string;
	bankCode?: string;
	accountName?: string;
	accountNumber?: string;
	isEmailVerified?: boolean;
	isProfileCompleted?: boolean;
	expoPushTokens?: {
		token: string;
		platform: "ios" | "android";
	}[];
	preferences?: {
		pushNotifications: boolean;
	};
	createdAt?: string;
	updatedAt?: string;
};
