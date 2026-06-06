export interface NotificationRegistrationResult {
	token: string;
	cleanup: () => void;
}
