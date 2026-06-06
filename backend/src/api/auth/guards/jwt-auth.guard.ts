import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

type AccessTokenPayload = {
	sub?: string;
	id?: string;
	email?: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly config: ConfigService,
	) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.extractToken(request);

		if (!token) throw new UnauthorizedException("Authentication required");

		try {
			const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
				secret: this.config.get<string>("JWT_ACCESS_SECRET") || this.config.get<string>("JWT_SECRET") || "development-secret",
			});
			const id = payload.id || payload.sub;
			if (!id || !payload.email) throw new UnauthorizedException("Invalid token");

			request["user"] = { id, email: payload.email, accessToken: token };
			return true;
		} catch {
			throw new UnauthorizedException("Invalid or expired token");
		}
	}

	private extractToken(request: Request) {
		const [type, token] = request.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}
}
