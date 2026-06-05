import { BadRequestException, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UploadService } from "./upload.service";

const uploadOptions = {
	limits: { fileSize: 20 * 1024 * 1024 },
	fileFilter: (_req: unknown, file: { mimetype?: string }, callback: (error: Error | null, acceptFile: boolean) => void) => {
		const isAccepted = Boolean(file.mimetype?.startsWith("image/") || file.mimetype?.startsWith("video/"));
		callback(isAccepted ? null : new BadRequestException("Only images and videos are allowed"), isAccepted);
	},
};

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Post("single")
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["file"],
			properties: {
				file: {
					type: "string",
					format: "binary",
					description: "Image or video file.",
				},
			},
		},
	})
	@UseInterceptors(FileInterceptor("file", uploadOptions))
	async uploadSingleFile(@UploadedFile() file?: any) {
		return this.uploadService.uploadSingle(file);
	}

	@Post("multiple")
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["files"],
			properties: {
				files: {
					type: "array",
					description: "Images, videos, or a mix of both.",
					items: { type: "string", format: "binary" },
				},
			},
		},
	})
	@UseInterceptors(FilesInterceptor("files", 5, uploadOptions))
	async uploadMultipleFiles(@UploadedFiles() files?: any[]) {
		return this.uploadService.uploadMultiple(files);
	}
}
