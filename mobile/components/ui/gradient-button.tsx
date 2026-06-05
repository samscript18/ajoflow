import { GradientButtonProps } from "@/interfaces/ui.interface";
import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function GradientButton({ label, onPress, disabled = false, loading = false, className = "mt-6", contentClassName = "h-16", icon = "arrow-forward", variant = "primary" }: GradientButtonProps) {
	const { theme } = useThemeStore();
	const scale = useSharedValue<number>(1);
	const isInactive = disabled || loading;
	const colors = variant === "primary" ? theme.gradients.primary : (["#1B1B1B", "#1B1B1B"] as const);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<AnimatedTouchableOpacity
			onPress={onPress}
			disabled={isInactive}
			activeOpacity={0.9}
			onPressIn={() => {
				scale.value = withSpring(0.97, { damping: 16, stiffness: 220 });
			}}
			onPressOut={() => {
				scale.value = withSpring(1, { damping: 16, stiffness: 220 });
			}}
			className={`${className} overflow-hidden rounded-[18px]`}
			style={[
				animatedStyle,
				{
					opacity: isInactive ? 0.76 : 1,
					shadowColor: theme.colors.coral,
					shadowOpacity: variant === "primary" ? 0.35 : 0.12,
					shadowRadius: 18,
					shadowOffset: { width: 0, height: 12 },
				},
			]}
		>
			<LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
				<View className={`${contentClassName} flex-row items-center justify-center gap-3`}>
					{loading ? (
						<ActivityIndicator color={variant === "primary" ? theme.colors.onPrimary : "#FFFFFF"} />
					) : (
						<>
							<Text className="font-manrope text-[17px] font-black" style={{ color: variant === "primary" ? theme.colors.onPrimary : "#FFFFFF" }}>
								{label}
							</Text>
							<Ionicons name={icon} size={20} color={variant === "primary" ? theme.colors.onPrimary : "#FFFFFF"} />
						</>
					)}
				</View>
			</LinearGradient>
		</AnimatedTouchableOpacity>
	);
}
