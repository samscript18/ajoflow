import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	protected throwThrottlingException(): Promise<void> {
		throw new HttpException(
			{
				success: false,
				message: "Too many authentication attempts. Please try again in a minute.",
			},
			HttpStatus.TOO_MANY_REQUESTS,
		);
	}
}
