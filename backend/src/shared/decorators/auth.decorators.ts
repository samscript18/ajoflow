import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { RoleNames } from "src/shared/enums";

export type AuthenticatedUser = {
	id: string;
	email: string;
	role: RoleNames;
	accessToken: string;
};

export const Roles = Reflector.createDecorator<RoleNames[]>();

export const IsPublic = Reflector.createDecorator();

export const Auth = createParamDecorator((props: keyof AuthenticatedUser, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest<Request>();

	return props ? req["user"]?.[props] : req["user"];
});
