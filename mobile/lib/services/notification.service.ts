import { ApiResponse } from "@/types/api";
import { GetNotificationsParams, RegisterExpoPushTokenDto, RemoveExpoPushTokenDto, UpdateNotificationPreferenceDto } from "@/types/notification/notification.dto";
import { Notification } from "@/types/notification/notification";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { authApi } from "../config/axios-instance";

export const getNotifications = async (params: GetNotificationsParams) => {
	try {
		const response = await authApi.get<
			ApiResponse<{
				notifications: Notification[];
				nextCursor: string | null;
			}>
		>("/notifications", { params });

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getNotificationsUnreadCount = async () => {
	try {
		const response = await authApi.get<ApiResponse<{ count: number }>>("/notifications/unread-count");

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const registerExpoPushToken = async (data: RegisterExpoPushTokenDto) => {
	try {
		const response = await authApi.post<ApiResponse<{ registered: boolean }>>("/notifications/tokens", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const removeExpoPushToken = async (data: RemoveExpoPushTokenDto) => {
	try {
		const response = await authApi.delete<ApiResponse<{ removed: boolean }>>("/notifications/tokens", { data });

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const updateNotificationPreference = async (data: UpdateNotificationPreferenceDto) => {
	try {
		const response = await authApi.patch<ApiResponse<{ preferences: UpdateNotificationPreferenceDto }>>("/notifications/preferences", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const markAllAsRead = async () => {
	try {
		const response = await authApi.patch<ApiResponse<{ modifiedCount: number }>>("/notifications/mark-all-as-read");

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const markAsRead = async (notificationId: string) => {
	try {
		const response = await authApi.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/mark-as-read`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
