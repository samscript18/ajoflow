import { ApiResponse } from "@/types/api";
import { Bank, BankAccountResolution, ResolveBankAccountRequest } from "@/types/paystack/paystack";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { publicApi } from "../config/axios-instance";

export const listBanks = async () => {
	try {
		const response = await publicApi.get<ApiResponse<{ banks: Bank[] }>>("/paystack/banks");
		return response.data.data.banks;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const resolveBankAccount = async (data: ResolveBankAccountRequest) => {
	try {
		const response = await publicApi.post<ApiResponse<BankAccountResolution>>("/paystack/resolve-bank-account", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
