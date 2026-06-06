import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { TemplatingService } from "./templating.service";

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory(configService: ConfigService) {
				return {
					transport: {
						host: configService.get<string>("MAILER_HOST") || configService.get<string>("SMTP_HOST"),
						port: configService.get<number>("MAILER_PORT") || configService.get<number>("SMTP_PORT"),
						secure: (configService.get<number>("MAILER_PORT") || configService.get<number>("SMTP_PORT")) === 465,
						auth: {
							user: configService.get<string>("MAILER_USER") || configService.get<string>("SMTP_USER"),
							pass: configService.get<string>("MAILER_PASS") || configService.get<string>("SMTP_PASS"),
						},
					},

					defaults: {
						from: configService.get<string>("MAILER_FROM_EMAIL") || configService.get<string>("SMTP_FROM"),
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
