import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
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

	async hashPassword(password: string): Promise<string> {
		const saltFactor = await bcrypt.genSalt(12);
		return bcrypt.hash(password, saltFactor);
	}

	async comparePasswords(password: string, hash: string): Promise<{ isValid: boolean }> {
		const validity = await bcrypt.compare(password, hash);
		return { isValid: validity };
	}

	apiKey() {
		const raw = `rx_live_${randomBytes(32).toString("hex")}`;
		return { raw, hash: this.hash(raw), preview: `${raw.slice(0, 12)}...${raw.slice(-6)}` };
	}

	token(length = 32) {
		return randomBytes(length).toString("hex");
	}

	reference(prefix = "RX") {
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const suffix = Math.floor(100000 + Math.random() * 900000);
		return `${prefix}-${date}-${suffix}`;
	}
}
