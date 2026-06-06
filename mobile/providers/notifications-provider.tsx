import { requestNotificationPermission, setupNotificationListeners } from "@/lib/config/notification";
import { registerExpoPushToken, removeExpoPushToken } from "@/lib/services/notification.service";
import { useAuthStore } from "@/store/useAuthStore";
import { ReactNode, useEffect, useRef } from "react";
import { Platform } from "react-native";

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const accessToken = useAuthStore((state) => state.accessToken);
	const registeredToken = useRef<string>("");

	useEffect(() => {
		let isMounted = true;
		let cleanupListeners: (() => void) | undefined;

		const syncToken = async (token: string) => {
			if (!token || registeredToken.current === token) return;
			await registerExpoPushToken({ token, platform: Platform.OS === "ios" ? "ios" : "android" });
			registeredToken.current = token;
		};

		const bootstrapNotifications = async () => {
			if (!isAuthenticated || !accessToken) return;

			const token = await requestNotificationPermission();
			if (token && isMounted) await syncToken(token);

			cleanupListeners = await setupNotificationListeners(async (nextToken) => {
				try {
					await syncToken(nextToken);
				} catch (error) {
					console.warn("Failed to sync refreshed push token", error);
				}
			});
		};

		bootstrapNotifications().catch((error) => {
			console.warn("Failed to initialize notifications", error);
		});

		return () => {
			isMounted = false;
			cleanupListeners?.();
		};
	}, [accessToken, isAuthenticated]);

	useEffect(() => {
		if (isAuthenticated || !registeredToken.current) return;

		const token = registeredToken.current;
		registeredToken.current = "";
		removeExpoPushToken({ token }).catch(() => {});
	}, [isAuthenticated]);

	return children;
};
