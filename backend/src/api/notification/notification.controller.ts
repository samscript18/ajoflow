import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthenticatedUser } from "src/shared/decorators/auth.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetNotificationsDto, RegisterExpoPushTokenDto, RemoveExpoPushTokenDto, UpdateNotificationPreferenceDto } from "./dto/notification.dto";
import { NotificationService } from "./notification.service";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
	constructor(private readonly notifications: NotificationService) {}

	@Get()
	@ApiOperation({ summary: "Fetch notifications" })
	async getNotifications(@Auth() user: AuthenticatedUser, @Query() query: GetNotificationsDto) {
		return await this.notifications.getNotifications(user.id, query);
	}

	@Get("unread-count")
	@ApiOperation({ summary: "Fetch unread notification count" })
	async getUnreadCount(@Auth() user: AuthenticatedUser) {
		return await this.notifications.getUnreadCount(user.id);
	}

	@Post("tokens")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Register an FCM token for the current device" })
	async registerToken(@Auth() user: AuthenticatedUser, @Body() dto: RegisterExpoPushTokenDto) {
		return await this.notifications.registerToken(user.id, dto);
	}

	@Delete("tokens")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Remove an FCM token for the current device" })
	async removeToken(@Auth() user: AuthenticatedUser, @Body() dto: RemoveExpoPushTokenDto) {
		return await this.notifications.removeToken(user.id, dto);
	}

	@Patch("preferences")
	@ApiOperation({ summary: "Update notification preferences" })
	async updatePreference(@Auth() user: AuthenticatedUser, @Body() dto: UpdateNotificationPreferenceDto) {
		return await this.notifications.updatePreference(user.id, dto);
	}

	@Patch("mark-all-as-read")
	@ApiOperation({ summary: "Mark all notifications as read" })
	async markAllAsRead(@Auth() user: AuthenticatedUser) {
		return await this.notifications.markAllAsRead(user.id);
	}

	@Patch(":notificationId/mark-as-read")
	@ApiOperation({ summary: "Mark a notification as read" })
	async markAsRead(@Auth() user: AuthenticatedUser, @Param("notificationId") notificationId: string) {
		return await this.notifications.markAsRead(user.id, notificationId);
	}
}
