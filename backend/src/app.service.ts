import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getRoot() {
		return { name: "AjoFlow API", status: "OK" };
	}
}
