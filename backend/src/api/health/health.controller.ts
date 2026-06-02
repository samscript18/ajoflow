import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Controller()
@ApiTags("Health")
export class HealthController {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	@Get("health")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Health check", description: "Confirms the API process is running." })
	health() {
		return { status: "OK" };
	}

	@Get("health/db")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Database health", description: "Verifies MongoDB connectivity." })
	dbHealth() {
		const isHealthy = this.connection.readyState === 1;
		return { status: isHealthy ? "OK" : "DEGRADED" };
	}
}
