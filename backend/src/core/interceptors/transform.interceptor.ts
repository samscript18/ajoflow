import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { success: boolean; message: string; data: T }> {
	intercept(_context: ExecutionContext, next: CallHandler): Observable<{ success: boolean; message: string; data: T }> {
		const context = _context.switchToHttp();
		const response = context.getResponse();
		const contentType = response?.getHeader?.("Content-Type");
		const isHtmlResponse = typeof contentType === "string" && contentType.includes("text/html");

		if (isHtmlResponse) {
			return next.handle();
		}

		return next.handle().pipe(
			map((data) => ({
				success: true,
				message: "Request successful",
				data,
			})),
		);
	}
}
