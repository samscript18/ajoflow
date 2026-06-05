import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ApiModule } from "./api/api.module";
import { envSchema } from "./shared/schemas/env.schema";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, validate: (env) => envSchema.parse(env) }),
		ThrottlerModule.forRoot([
			{ name: "default", ttl: 60000, limit: 120 },
			{ name: "authLimit", ttl: 60000, limit: 5 },
		]),
		ApiModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
