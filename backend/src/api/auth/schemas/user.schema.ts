import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ExpoPushToken } from "src/api/notification/interfaces/notification.interface";

@Schema({ timestamps: true })
export class User {
	@Prop({ trim: true })
	firstName: string;

	@Prop({ trim: true })
	lastName: string;

	@Prop({ required: true, trim: true, lowercase: true, unique: true, index: true })
	email: string;

	@Prop({ trim: true, lowercase: true, unique: true, sparse: true, index: true })
	userName: string;

	@Prop()
	password?: string;

	@Prop()
	googleId?: string;

	@Prop()
	profileImage?: string;

	@Prop()
	bio?: string;

	@Prop()
	bankName?: string;

	@Prop()
	accountNumber?: string;

	@Prop()
	resetPasswordToken?: string;

	@Prop()
	resetPasswordExpires?: Date;

	@Prop({ default: false })
	isEmailVerified?: boolean;

	@Prop()
	emailOtp?: string;

	@Prop()
	emailOtpExpires?: Date;

	@Prop({ default: 0 })
	loginAttempts?: number;

	@Prop()
	loginBlockedUntil?: Date;

	@Prop({
		type: [
			{
				token: { type: String, required: true },
				platform: { type: String, enum: ["ios", "android"], required: true },
			},
		],
		default: [],
	})
	expoPushTokens?: ExpoPushToken[];

	@Prop({
		type: {
			pushNotifications: { type: Boolean, default: true },
		},
		default: { pushNotifications: true },
	})
	preferences?: {
		pushNotifications: boolean;
	};
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ "expoPushTokens.token": 1 });
export type UserDocument = HydratedDocument<User>;
