import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/constants/env";
import Constants, { ExecutionEnvironment } from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo" || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const isGoogleSignInAvailable = !isExpoGo;

let googleSigninModule: typeof import("@react-native-google-signin/google-signin").GoogleSignin | null = null;

const getGoogleSignin = () => {
	if (!isGoogleSignInAvailable) return null;

	if (!googleSigninModule) {
		try {
			googleSigninModule = require("@react-native-google-signin/google-signin").GoogleSignin;
			googleSigninModule?.configure({
				webClientId: GOOGLE_WEB_CLIENT_ID,
				iosClientId: GOOGLE_IOS_CLIENT_ID,
				offlineAccess: false,
			});
		} catch (error) {
			console.warn("Google Sign-In native module is not available", error);
			return null;
		}
	}

	return googleSigninModule;
};

export const signInWithGoogle = async () => {
	const GoogleSignin = getGoogleSignin();

	if (!GoogleSignin) {
		throw new Error("Google Sign-In requires a development build and is not available in Expo Go.");
	}

	await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
	const result = await GoogleSignin.signIn();
	const tokens = await GoogleSignin.getTokens();
	const idToken = tokens.idToken || result.data?.idToken;

	if (!idToken) {
		throw new Error("Google sign-in did not return an ID token.");
	}

	return { idToken };
};

export const signOutFromGoogle = async () => {
	const GoogleSignin = getGoogleSignin();
	if (!GoogleSignin) return;

	await GoogleSignin.signOut();
};
