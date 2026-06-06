import { NotificationCategory, NotificationPlatform } from "./notification";

export type GetNotificationsParams = {
	cursor?: string;
	limit?: number;
	category?: NotificationCategory;
};

export type RegisterExpoPushTokenDto = {
	token: string;
	platform: NotificationPlatform;
};

export type RemoveExpoPushTokenDto = {
	token: string;
};

export type UpdateNotificationPreferenceDto = {
	pushNotifications: boolean;
};
