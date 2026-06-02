import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

export class ValidationException extends BadRequestException {
	constructor(errors: ValidationError[]) {
		super({
			code: "VALIDATION_ERROR",
			message: "Validation failed",
			details: errors.map((error) => ({
				field: error.property,
				constraints: error.constraints,
			})),
		});
	}
}
