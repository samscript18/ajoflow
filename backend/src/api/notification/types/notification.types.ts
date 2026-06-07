import { Types } from "mongoose";

export type ExpoPushTicket = {
	status: "ok" | "error";
	id?: string;
	message?: string;
	details?: {
		error?: string;
	};
};

export type NotificationCreatedEvent = {
	notificationId: Types.ObjectId;
	sendPush: boolean;
};
