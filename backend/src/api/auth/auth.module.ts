import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SharedModule } from "src/shared/shared.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CustomThrottlerGuard } from "./guards/auth-throttler.guard";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
	imports: [SharedModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	controllers: [AuthController],
	providers: [AuthService, CustomThrottlerGuard],
	exports: [AuthService],
})
export class AuthModule {}
