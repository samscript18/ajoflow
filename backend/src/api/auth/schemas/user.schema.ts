import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	_id: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;

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
}

export const UserSchema = SchemaFactory.createForClass(User);
