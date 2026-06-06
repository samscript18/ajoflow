import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { UploadModule } from "./upload/upload.module";
import { AuthModule } from "./auth/auth.module";
import { NotificationModule } from "./notification/notification.module";
import { PaystackModule } from "./paystack/paystack.module";

@Module({
	imports: [DatabaseModule, HealthModule, AuthModule, UploadModule, NotificationModule, PaystackModule],
})
export class ApiModule {}
