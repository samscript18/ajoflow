import Constants from "expo-constants";
import { Platform } from "react-native";

const resolveApiUrl = () => {
	const rawUrl = process.env.EXPO_PUBLIC_API_URL;

	if (!rawUrl) return rawUrl;

	try {
		const parsedUrl = new URL(rawUrl);
		const isLocalHost = parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1";

		if (!__DEV__ || !isLocalHost) return rawUrl;

		const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

		if (expoHost) {
			parsedUrl.hostname = expoHost;
			return parsedUrl.toString().replace(/\/$/, "");
		}

		if (Platform.OS === "android") {
			parsedUrl.hostname = "10.0.2.2";
			return parsedUrl.toString().replace(/\/$/, "");
		}

		return rawUrl;
	} catch {
		return rawUrl;
	}
};

export const API_URL = resolveApiUrl();
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
