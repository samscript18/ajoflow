import { ApiResponse } from "@/types/api";
import { BulkUploadResult, UploadFileResult } from "@/types/upload/upload";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { publicApi } from "../config/axios-instance";

export const uploadSingleFile = async (data: FormData) => {
	try {
		const response = await publicApi.post<ApiResponse<UploadFileResult>>("/upload/single", data, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const uploadMultipleFiles = async (data: FormData) => {
	try {
		const response = await publicApi.post<ApiResponse<BulkUploadResult>>("/upload/multiple", data, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
