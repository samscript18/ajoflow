export type UploadFileResult = {
	url: string;
	publicId?: string;
	resourceType?: string;
};

export type BulkUploadResult = {
	urls: string[];
	files?: UploadFileResult[];
};
