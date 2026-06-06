import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { StringValue } from "ms";
import { SharedModule } from "src/shared/shared.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CustomThrottlerGuard } from "./guards/auth-throttler.guard";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
	imports: [
		SharedModule,
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>("JWT_SECRET"),
				signOptions: {
					expiresIn: (config.get<string>("JWT_ACCESS_EXPIRES_IN")) as StringValue,
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, CustomThrottlerGuard],
	exports: [AuthService],
})
export class AuthModule {}
