import { AnimatedScreenProps, AnimatedSectionProps } from "@/interfaces/ui.interface";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

export function AnimatedScreen({ children, className = "flex-1", delay = 0 }: AnimatedScreenProps) {
	return (
		<Animated.View entering={FadeIn.duration(420).delay(delay)} className={className}>
			{children}
		</Animated.View>
	);
}

export function AnimatedSection({ children, className, delay = 80 }: AnimatedSectionProps) {
	return (
		<Animated.View entering={FadeInUp.duration(520).delay(delay).springify().damping(18)} className={className}>
			{children}
		</Animated.View>
	);
}
