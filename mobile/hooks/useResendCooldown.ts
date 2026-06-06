import { useEffect, useMemo, useState } from "react";

const DEFAULT_COOLDOWN_SECONDS = 180;

export function useResendCooldown(durationSeconds = DEFAULT_COOLDOWN_SECONDS) {
	const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

	useEffect(() => {
		if (remainingSeconds <= 0) return;

		const interval = setInterval(() => {
			setRemainingSeconds((seconds) => Math.max(seconds - 1, 0));
		}, 1000);

		return () => clearInterval(interval);
	}, [remainingSeconds]);

	const formattedTime = useMemo(() => {
		const minutes = Math.floor(remainingSeconds / 60);
		const seconds = remainingSeconds % 60;

		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}, [remainingSeconds]);

	const startCooldown = () => setRemainingSeconds(durationSeconds);

	return {
		formattedTime,
		isCoolingDown: remainingSeconds > 0,
		remainingSeconds,
		startCooldown,
	};
}
