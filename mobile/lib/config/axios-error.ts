import { Alert } from "react-native";

export type AxiosErrorShape = {
	response?: {
		data?: {
			message?: string;
			error?: string;
		};
	};
	message?: string;
};

export function errorHandler<T = AxiosErrorShape | string>(error: AxiosErrorShape | string, displayAlert = true): T {
	console.error(error);
	const extractedError = typeof error === "object" && "response" in error ? error.response?.data?.message || error.response?.data?.error || error.message : error;
	if (displayAlert) {
		Alert.alert("Error", String(extractedError) || "An unknown error occurred");
	}
	return extractedError as T;
}
