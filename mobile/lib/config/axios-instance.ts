import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/env";
import { AxiosErrorShape } from "./axios-error";

export const publicApi: AxiosInstance = axios.create({
	baseURL: API_URL,
	withCredentials: false,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

if (__DEV__) {
	publicApi.interceptors.request.use((config) => {
		const method = config.method?.toUpperCase() ?? "GET";
		console.log(`[HTTP][public][request] ${method} ${config.baseURL ?? ""}${config.url ?? ""}`);
		return config;
	});
	publicApi.interceptors.response.use(
		(response) => {
			const method = response.config.method?.toUpperCase() ?? "GET";
			console.log(`[HTTP][public][response] ${response.status} ${method} ${response.config.baseURL ?? ""}${response.config.url ?? ""}`);
			return response;
		},
		(error: AxiosError<AxiosErrorShape>) => {
			const method = error.config?.method?.toUpperCase() ?? "GET";
			const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
			console.log(`[HTTP][public][error] ${error.response?.status ?? "ERR"} ${method} ${url}`);
			return Promise.reject(error);
		},
	);
}

export const authApi: AxiosInstance = axios.create({
	baseURL: API_URL,
	withCredentials: false,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	transformRequest: (data, headers) => {
		if (data instanceof FormData) {
			delete headers["Content-Type"];
			return data;
		}
		return JSON.stringify(data);
	},
});

if (__DEV__) {
	authApi.interceptors.request.use((config) => {
		const method = config.method?.toUpperCase() ?? "GET";
		console.log(`[HTTP][auth][request] ${method} ${config.baseURL ?? ""}${config.url ?? ""}`);
		return config;
	});
	authApi.interceptors.response.use(
		(response) => {
			const method = response.config.method?.toUpperCase() ?? "GET";
			console.log(`[HTTP][auth][response] ${response.status} ${method} ${response.config.baseURL ?? ""}${response.config.url ?? ""}`);
			return response;
		},
		(error: AxiosError<AxiosErrorShape>) => {
			const method = error.config?.method?.toUpperCase() ?? "GET";
			const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
			console.log(`[HTTP][auth][error] ${error.response?.status ?? "ERR"} ${method} ${url}`);
			return Promise.reject(error);
		},
	);
}

authApi.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = useAuthStore.getState().accessToken;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => Promise.reject(error),
);

authApi.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<AxiosErrorShape>) => {
		const status = error.response?.status;

		if (status === 401 || status === 403) {
			useAuthStore.getState().logout();
			delete authApi.defaults.headers.common["Authorization"];
		}

		return Promise.reject(error);
	},
);
