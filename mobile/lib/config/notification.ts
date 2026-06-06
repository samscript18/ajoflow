import Constants from "expo-constants";
import * as Device from "expo-device";
import type * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";

type NotificationsModule = typeof ExpoNotifications;

let notificationsModulePromise: Promise<NotificationsModule> | null = null;
let hasConfiguredNotificationHandler = false;
let hasWarnedAndroidExpoGo = false;

const isAndroidExpoGo = Platform.OS === "android" && Constants.appOwnership === "expo";

const getProjectId = () => Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

const getNotificationsModule = async (): Promise<NotificationsModule | null> => {
	if (isAndroidExpoGo) {
		if (!hasWarnedAndroidExpoGo) {
			hasWarnedAndroidExpoGo = true;
			console.warn("Android push notifications are not available in Expo Go. Use a development build to test push notifications on Android.");
		}
		return null;
	}

	notificationsModulePromise ??= import("expo-notifications");
	const Notifications = await notificationsModulePromise;

	if (!hasConfiguredNotificationHandler) {
		hasConfiguredNotificationHandler = true;
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldPlaySound: false,
				shouldSetBadge: false,
				shouldShowBanner: true,
				shouldShowList: true,
			}),
		});
	}

	return Notifications;
};

export const requestNotificationPermission = async () => {
	try {
		const Notifications = await getNotificationsModule();
		if (!Notifications) return null;

		if (!Device.isDevice) {
			console.warn("Push notifications require a physical device.");
			return null;
		}

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#EFB936",
			});
		}

		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") return null;

		const projectId = getProjectId();
		if (!projectId) {
			console.warn("Expo push token requires an EAS project ID.");
			return null;
		}

		const token = await Notifications.getExpoPushTokenAsync({ projectId });
		return token.data;
	} catch (error) {
		console.warn("Notification permission failed", error);
		return null;
	}
};

export const setupNotificationListeners = async (onTokenRefreshSync: (token: string) => void) => {
	try {
		const Notifications = await getNotificationsModule();
		if (!Notifications) return () => {};

		const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
			console.log("Foreground notification:", notification.request.identifier);
		});

		const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
			console.log("Notification response:", response.notification.request.identifier);
		});

		const tokenSubscription = Notifications.addPushTokenListener(async () => {
			const token = await requestNotificationPermission();
			if (token) onTokenRefreshSync(token);
		});

		return () => {
			notificationSubscription.remove();
			responseSubscription.remove();
			tokenSubscription.remove();
		};
	} catch (error) {
		console.warn("Failed to setup notification listeners", error);
		return () => {};
	}
};
