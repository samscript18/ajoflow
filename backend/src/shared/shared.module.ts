import { Module } from "@nestjs/common";
import { UtilsService } from "./services/utils.service";
import { MailService } from "./mail/mail.service";

@Module({
	providers: [UtilsService, MailService],
	exports: [UtilsService, MailService],
})
export class SharedModule {}
