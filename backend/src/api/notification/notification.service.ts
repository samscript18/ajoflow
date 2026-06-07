import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { FilterQuery, Model, Types } from "mongoose";
import { User, UserDocument } from "src/api/auth/schemas/user.schema";
import { EventNames } from "src/shared/enums";
import {
	GetNotificationsDto,
	RegisterExpoPushTokenDto,
	RemoveExpoPushTokenDto,
	UpdateNotificationPreferenceDto,
} from "./dto/notification.dto";
import { CreateNotificationPayload } from "./interfaces/notification.interface";
import { Notification, NotificationDocument } from "./schemas/notification.schema";
import { ExpoPushTicket, NotificationCreatedEvent } from "./types/notification.types";

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		@InjectModel(Notification.name) private readonly notifications: Model<NotificationDocument>,
		@InjectModel(User.name) private readonly users: Model<UserDocument>,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async registerToken(userId: string, dto: RegisterExpoPushTokenDto) {
		await this.users.findByIdAndUpdate(userId, {
			$pull: { expoPushTokens: { token: dto.token } },
		});

		await this.users.findByIdAndUpdate(userId, {
			$push: { expoPushTokens: { token: dto.token, platform: dto.platform } },
		});

		return { registered: true };
	}

	async removeToken(userId: string, dto: RemoveExpoPushTokenDto) {
		await this.users.findByIdAndUpdate(userId, {
			$pull: { expoPushTokens: { token: dto.token } },
		});

		return { removed: true };
	}

	async updatePreference(userId: string, dto: UpdateNotificationPreferenceDto) {
		const user = await this.users
			.findByIdAndUpdate(userId, { "preferences.pushNotifications": dto.pushNotifications }, { new: true })
			.select("preferences");
		if (!user) throw new NotFoundException("User not found");

		return { preferences: user.preferences };
	}

	async createNotification(payload: CreateNotificationPayload) {
		const notification = await this.notifications.create({
			recipient: new Types.ObjectId(payload.recipient),
			title: payload.title,
			body: payload.body,
			type: payload.type,
			data: payload.data ?? {},
		});

		if (payload.sendPush !== false) {
			this.eventEmitter.emit(EventNames.NotificationCreated, {
				notificationId: notification._id,
				sendPush: true,
			});
		}

		return notification;
	}

	async getNotifications(userId: string, query: GetNotificationsDto) {
		const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
		const filter: FilterQuery<NotificationDocument> = { recipient: new Types.ObjectId(userId) };

		if (query.category === "unread") filter.isRead = false;
		if (query.cursor) filter.createdAt = { $lt: new Date(query.cursor) };

		const notifications = await this.notifications
			.find(filter)
			.sort({ createdAt: -1, _id: -1 })
			.limit(limit + 1)
			.lean();
		const hasNextPage = notifications.length > limit;
		const data = hasNextPage ? notifications.slice(0, limit) : notifications;
		const nextCursor = hasNextPage && data.length ? data[data.length - 1].createdAt?.toISOString() : null;

		return { notifications: data, nextCursor };
	}

	async markAsRead(userId: string, notificationId: string) {
		const notification = await this.notifications.findOneAndUpdate(
			{ _id: notificationId, recipient: new Types.ObjectId(userId) },
			{ isRead: true },
			{ new: true },
		);
		if (!notification) throw new NotFoundException("Notification not found");

		return notification;
	}

	async markAllAsRead(userId: string) {
		const result = await this.notifications.updateMany({ recipient: new Types.ObjectId(userId), isRead: false }, { isRead: true });
		return { modifiedCount: result.modifiedCount };
	}

	async getUnreadCount(userId: string) {
		const count = await this.notifications.countDocuments({ recipient: new Types.ObjectId(userId), isRead: false });
		return { count };
	}

	@OnEvent(EventNames.NotificationCreated)
	async sendPushNotification(payload: NotificationCreatedEvent) {
		if (!payload.sendPush) return;

		try {
			const notification = await this.notifications.findById(payload.notificationId).lean();
			if (!notification) return;

			const user = await this.users.findById(notification.recipient).select("expoPushTokens preferences").lean();
			if (!user?.preferences?.pushNotifications || !user.expoPushTokens?.length) return;

			const tokenEntries = user.expoPushTokens;
			const tokens = tokenEntries.map((entry) => entry.token).filter(Boolean);
			if (!tokens.length) return;

			const messages = tokens.map((to) => ({
				to,
				title: notification.title,
				body: notification.body,
				sound: "default",
				data: {
					notificationId: notification._id.toString(),
					type: notification.type,
					...(notification.data ?? {}),
				},
			}));

			const response = await axios.post<{ data: ExpoPushTicket[] }>("https://exp.host/--/api/v2/push/send", messages, {
				headers: {
					Accept: "application/json",
					"Accept-Encoding": "gzip, deflate",
					"Content-Type": "application/json",
				},
			});

			const failedTokens = response.data.data.reduce<string[]>((tokensToRemove, ticket, index) => {
				const shouldRemove = ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered";
				if (shouldRemove && tokenEntries[index]?.token) tokensToRemove.push(tokenEntries[index].token);
				return tokensToRemove;
			}, []);

			if (failedTokens.length) {
				await this.users.findByIdAndUpdate(user._id, {
					$pull: { expoPushTokens: { token: { $in: failedTokens } } },
				});
			}
		} catch (error) {
			this.logger.warn(`Push notification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
