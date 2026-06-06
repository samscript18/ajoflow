import { IsBoolean, IsEnum, IsString } from "src/shared/decorators";
import { NotificationPlatform } from "../interfaces/notification.interface";

export class GetNotificationsDto {
	@IsString(true)
	cursor?: string;

	@IsString(true)
	limit?: string;

	@IsString(true)
	category?: "all" | "unread";
}

export class RegisterExpoPushTokenDto {
	@IsString(false)
	token: string;

	@IsEnum(NotificationPlatform, false)
	platform: NotificationPlatform;
}

export class RemoveExpoPushTokenDto {
	@IsString(false)
	token: string;
}

export class UpdateNotificationPreferenceDto {
	@IsBoolean(false)
	pushNotifications: boolean;
}
