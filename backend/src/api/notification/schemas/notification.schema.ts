import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "src/api/auth/schemas/user.schema";
import { NotificationData, NotificationType } from "../interfaces/notification.interface";

@Schema({ timestamps: true })
export class Notification {
	@Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
	recipient: Types.ObjectId;

	@Prop({ required: true, trim: true })
	title: string;

	@Prop({ required: true, trim: true })
	body: string;

	@Prop({ type: String, enum: Object.values(NotificationType), default: NotificationType.system, index: true })
	type: NotificationType;

	@Prop({ type: Object, default: {} })
	data?: NotificationData;

	@Prop({ default: false, index: true })
	isRead: boolean;

	createdAt?: Date;

	updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export type NotificationDocument = HydratedDocument<Notification>;
