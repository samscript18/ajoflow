import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);

	constructor(private readonly config: ConfigService) {}

	async send(to: string, subject: string, html: string) {
		const host = this.config.get<string>("SMTP_HOST");
		const port = this.config.get<number>("SMTP_PORT");
		const user = this.config.get<string>("SMTP_USER");
		const pass = this.config.get<string>("SMTP_PASS");
		const from = this.config.get<string>("SMTP_FROM") || this.config.get<string>("ESCALATION_EMAIL_FROM") || user;

		if (!host || !port || !user || !pass || !from) {
			this.logger.log(`Email skipped (Missing SMTP Credentials): ${subject} -> ${to}`);
			return { skipped: true };
		}

		const transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465,
			auth: { user, pass },
		});

		try {
			const info = await transporter.sendMail({ from, to, subject, html });

			this.logger.log(`Email successfully sent to ${to}`);
			return info;
		} catch (error) {
			this.logger.error(`Failed to send email to ${to}`, error instanceof Error ? error.stack : error);
			throw error;
		}
	}
}
