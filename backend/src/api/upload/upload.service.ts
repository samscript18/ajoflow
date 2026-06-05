import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class UploadService {
	constructor(private readonly config: ConfigService) {
		cloudinary.config({
			cloud_name: this.config.get<string>("CLOUDINARY_CLOUD_NAME"),
			api_key: this.config.get<string>("CLOUDINARY_API_KEY"),
			api_secret: this.config.get<string>("CLOUDINARY_API_SECRET"),
		});
	}

	async uploadSingle(file?: any) {
		if (!file) throw new BadRequestException("No file provided");

		const uploaded = await this.uploadToCloudinary(file);
		return { url: uploaded.secure_url, publicId: uploaded.public_id, resourceType: uploaded.resource_type };
	}

	async uploadMultiple(files?: any[]) {
		if (!files?.length) throw new BadRequestException("No files provided");

		const uploaded = await Promise.all(files.map((file) => this.uploadToCloudinary(file)));
		return {
			urls: uploaded.map((file) => file.secure_url),
			files: uploaded.map((file) => ({ url: file.secure_url, publicId: file.public_id, resourceType: file.resource_type })),
		};
	}

	private async uploadToCloudinary(file: any): Promise<UploadApiResponse> {
		if (!this.config.get<string>("CLOUDINARY_CLOUD_NAME") || !this.config.get<string>("CLOUDINARY_API_KEY") || !this.config.get<string>("CLOUDINARY_API_SECRET")) {
			throw new InternalServerErrorException("Cloudinary credentials are not configured");
		}

		const buffer = file.buffer;
		if (!buffer) throw new BadRequestException("Invalid file upload");

		return new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{
					folder: "ajoflow",
					resource_type: "auto",
					public_id: `${Date.now()}-${this.safeName(file.originalname)}`,
				},
				(error, result) => {
					if (error || !result) {
						reject(error ?? new Error("Upload failed"));
						return;
					}

					resolve(result);
				},
			);

			Readable.from(buffer).pipe(stream);
		});
	}

	private safeName(name = "upload") {
		return name
			.split(".")[0]
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
}
