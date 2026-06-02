import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";

export class IntPipe implements PipeTransform {
	transform(value: string, _metadata: ArgumentMetadata) {
		const val = parseInt(value, 10);
		if (isNaN(val)) {
			throw new BadRequestException("parse a valid integer");
		}
		return val;
	}
}
