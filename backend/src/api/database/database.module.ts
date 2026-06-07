import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
	imports: [
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				uri: config.get<string>("MONGODB_URI"),
				connectionFactory(connection) {
					console.log("[Database] - connected");
					return connection;
				},
			}),
		}),
	],
})
export class DatabaseModule {}
