import * as SecureStore from "expo-secure-store";
import { StateStorage } from "zustand/middleware";

export const secureStorage: StateStorage<Promise<void>> = {
	getItem: (name: string) => SecureStore.getItemAsync(name),
	setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
	removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const getSecureItem = (key: string) => SecureStore.getItemAsync(key);
export const setSecureItem = (key: string, value: string) => SecureStore.setItemAsync(key, value);
export const deleteSecureItem = (key: string) => SecureStore.deleteItemAsync(key);
