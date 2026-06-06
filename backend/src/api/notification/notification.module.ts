import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { StringValue } from "ms";
import { User, UserSchema } from "../auth/schemas/user.schema";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { Notification, NotificationSchema } from "./schemas/notification.schema";

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Notification.name, schema: NotificationSchema },
		]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>("JWT_ACCESS_SECRET") || config.get<string>("JWT_SECRET") || "development-secret",
				signOptions: {
					expiresIn: (config.get<string>("JWT_ACCESS_EXPIRES_IN") || "15m") as StringValue,
				},
			}),
		}),
	],
	controllers: [NotificationController],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
