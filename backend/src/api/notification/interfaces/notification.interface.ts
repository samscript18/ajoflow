import { Types } from "mongoose";

export enum NotificationType {
	account = "account",
	payment = "payment",
	security = "security",
	system = "system",
}

export enum NotificationPlatform {
	ios = "ios",
	android = "android",
}

export type ExpoPushToken = {
	token: string;
	platform: NotificationPlatform;
};

export type NotificationData = Record<string, string>;

export type CreateNotificationPayload = {
	recipient: string | Types.ObjectId;
	title: string;
	body: string;
	type?: NotificationType;
	data?: NotificationData;
	sendPush?: boolean;
};
