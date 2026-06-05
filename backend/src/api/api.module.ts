import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { UploadModule } from "./upload/upload.module";
import { AuthModule } from "./auth/auth.module";

@Module({
	imports: [DatabaseModule, HealthModule, AuthModule, UploadModule],
})
export class ApiModule {}
