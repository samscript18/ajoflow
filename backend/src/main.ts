import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { randomUUID } from "crypto";
import { AppModule } from "./app.module";
import { ValidationException } from "./core/exceptions/validation.exception";
import { GlobalExceptionFilter } from "./core/filters/global.filter";
import { TransformInterceptor } from "./core/interceptors/transform.interceptor";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
	const logger = new Logger("HTTP");
	app.set("trust proxy", 1);
	app.disable("x-powered-by");
	app.use(helmet());

	const configService = app.get(ConfigService);
	const PORT = configService.get<number>("PORT") || 4000;
	const allowedOrigins = (configService.get<string>("ALLOWED_ORIGINS") || "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);

	app.enableCors({
		origin: allowedOrigins.length ? allowedOrigins : configService.get<string>("FRONTEND_URL") || "*",
	});
	app.useBodyParser("json", { limit: "10mb" });

	app.use((req, res, next) => {
		const requestId = normalizeRequestId(req.headers["x-request-id"]);
		const startedAt = Date.now();
		(req as { requestId?: string }).requestId = requestId;
		res.setHeader("x-request-id", requestId);

		let completed = false;
		const logRequest = (event: "finish" | "close") => {
			if (completed) return;
			completed = true;
			const durationMs = Date.now() - startedAt;
			const logPayload = {
				event: event === "close" && !res.writableEnded ? "request_aborted" : "request_completed",
				requestId,
				method: req.method,
				path: req.originalUrl,
				statusCode: res.statusCode,
				durationMs,
				ip: req.ip,
			};

			if (isHealthPath(req.originalUrl)) return;
			const message = JSON.stringify(logPayload);
			if (event === "close" && !res.writableEnded) logger.warn(message);
			else if (res.statusCode >= 500) logger.error(message);
			else if (res.statusCode >= 400) logger.warn(message);
			else logger.log(message);
		};

		res.once("finish", () => logRequest("finish"));
		res.once("close", () => logRequest("close"));
		next();
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			exceptionFactory: (errors) => new ValidationException(errors),
		}),
	);
	app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));
	app.useGlobalInterceptors(new TransformInterceptor());

	const swaggerConfig = new DocumentBuilder()
		.setTitle("AjoFlow API")
		.setDescription("AjoFlow backend API starter.")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();
	SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swaggerConfig));

	app
		.getHttpAdapter()
		.getInstance()
		.get("/health-check", (_, res) => res.json({ status: "OK" }));

	await app.listen(PORT, "0.0.0.0");
	logger.log(`Server running on: port ${PORT}`);
}

function normalizeRequestId(header: string | string[] | undefined) {
	const requestId = Array.isArray(header) ? header[0] : header;
	if (requestId && /^[a-zA-Z0-9._:-]{8,128}$/.test(requestId)) return requestId;
	return randomUUID();
}

function isHealthPath(path: string) {
	return path === "/health" || path === "/health/db" || path === "/health-check";
}

bootstrap();
