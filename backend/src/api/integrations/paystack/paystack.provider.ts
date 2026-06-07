import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Paystack from "@paystack/paystack-sdk";
import type { PaystackClient } from "./types/paystack.types";

export const PAYSTACK_PROVIDER = "PAYSTACK_PROVIDER";

export const PaystackProvider: Provider = {
	provide: PAYSTACK_PROVIDER,
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		const secretKey = configService.get<string>("PAYSTACK_SECRET_KEY");
		if (!secretKey) {
			throw new Error("Paystack secret key is not defined in the configuration");
		}

		return new Paystack(secretKey) as PaystackClient;
	},
};
