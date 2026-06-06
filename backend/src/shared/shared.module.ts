import { Module } from "@nestjs/common";
import { UtilsService } from "./services/utils.service";
import { MailModule } from "./mail/mail.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [ConfigModule, MailModule],
	providers: [UtilsService, MailModule],
	exports: [UtilsService, MailModule],
})
export class SharedModule {}
