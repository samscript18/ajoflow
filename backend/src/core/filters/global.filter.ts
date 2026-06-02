import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Request } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const requestId = (request as Request & { requestId?: string }).requestId || request?.headers?.["x-request-id"];

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";
		let details: any = {};

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const response = exception.getResponse();
			message = typeof response === "string" ? response : (response as any).message || message;
			details = typeof response === "object" ? (response as any).details || (response as any).errors || {} : {};
		} else if ((exception as any)?.code === 11000) {
			status = HttpStatus.CONFLICT;
			message = "Duplicate resource detected";
			details = (exception as any).keyValue;
		} else {
			this.logger.error(`Unhandled Exception: ${exception instanceof Error ? exception.stack : exception}`);
		}

		const responseBody = exception instanceof HttpException ? (exception.getResponse() as any) : {};
		const code = responseBody.code || this.statusToCode(status);

		httpAdapter.reply(
			ctx.getResponse(),
			{
				success: false,
				code,
				message,
				details,
				timestamp: new Date().toISOString(),
				requestId,
				path: request?.url,
			},
			status,
		);
	}

	private statusToCode(status: number) {
		switch (status) {
			case HttpStatus.BAD_REQUEST:
				return "BAD_REQUEST";
			case HttpStatus.UNAUTHORIZED:
				return "UNAUTHORIZED";
			case HttpStatus.FORBIDDEN:
				return "FORBIDDEN";
			case HttpStatus.NOT_FOUND:
				return "RESOURCE_NOT_FOUND";
			case HttpStatus.CONFLICT:
				return "CONFLICT";
			case HttpStatus.TOO_MANY_REQUESTS:
				return "RATE_LIMITED";
			default:
				return status >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED";
		}
	}
}
