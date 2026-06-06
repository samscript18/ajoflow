import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { TemplatingService } from "./templating.service";

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory(configService: ConfigService) {
				const service = configService.get<string>("MAILER_SERVICE");
				const user = configService.get<string>("MAILER_USER");
				const pass = configService.get<string>("MAILER_PASS");
				return {
					transport: {
						service,
						auth: {
							user,
							pass,
						},
					},

					defaults: {
						from: configService.get<string>("MAILER_FROM_EMAIL"),
					},

					template: {
						dir: join(process.cwd(), "src/shared/mail/templates"),
						adapter: new HandlebarsAdapter(),
						options: {
							strict: true,
						},
					},
				};
			},
		}),
	],
	providers: [MailService, TemplatingService],
	exports: [MailService, TemplatingService],
})
export class MailModule {}
