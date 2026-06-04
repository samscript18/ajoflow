import { Controller, Get, Header, HttpCode, HttpStatus } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiExcludeController } from "@nestjs/swagger";
import { IsPublic } from "./shared/decorators/auth.decorators";

@Controller()
@ApiExcludeController()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@Header("Content-Type", "text/html; charset=utf-8")
	@IsPublic()
	async getHello(): Promise<string> {
		return await Promise.resolve(this.appService.getPage());
	}
}
