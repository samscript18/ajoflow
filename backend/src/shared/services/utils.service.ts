import { Injectable } from "@nestjs/common";
import { createHash, randomBytes, randomInt } from "crypto";
import slugify from "slugify";
import * as bcrypt from "bcrypt";

@Injectable()
export class UtilsService {
	slug(value: string) {
		return slugify(value, { lower: true, strict: true });
	}

	hash(value: string) {
		return createHash("sha256").update(value).digest("hex");
	}

	generateOtpToken() {
		const token = randomInt(0, 1000000).toString().padStart(6, "0");
		const hashedToken = this.hash(token);

		return { token, hashedToken };
	}

	async hashPassword(password: string): Promise<string> {
		const saltFactor = await bcrypt.genSalt(12);
		return bcrypt.hash(password, saltFactor);
	}

	async comparePasswords(password: string, hash: string): Promise<{ isValid: boolean }> {
		const validity = await bcrypt.compare(password, hash);
		return { isValid: validity };
	}

	excludePassword<T extends { password?: string | null }>(user: T): Omit<T, "password"> {
		delete user.password;

		return user as Omit<T, "password">;
	}

	token(length = 32) {
		return randomBytes(length).toString("hex");
	}
}
