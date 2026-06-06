import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { NotificationsProvider } from "./notifications-provider";

const queryClient = new QueryClient();

export const AppProvider = ({ children }: { children: ReactNode }) => {
	return (
		<QueryClientProvider client={queryClient}>
			<NotificationsProvider>{children}</NotificationsProvider>
		</QueryClientProvider>
	);
};
