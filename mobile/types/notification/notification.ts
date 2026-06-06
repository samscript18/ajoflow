export type NotificationCategory = "all" | "unread";

export type NotificationPlatform = "ios" | "android";

export type NotificationType = "account" | "payment" | "security" | "system";

export type Notification = {
	_id: string;
	recipient: string;
	title: string;
	body: string;
	type: NotificationType;
	data?: Record<string, string>;
	isRead: boolean;
	createdAt?: string;
	updatedAt?: string;
};
