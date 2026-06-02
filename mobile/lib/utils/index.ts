export function getRelativeTime(isoString: string) {
	const date = new Date(isoString);
	const now = new Date();
	const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

	const units = [
		{ unit: "year", seconds: 31536000 },
		{ unit: "month", seconds: 2592000 },
		{ unit: "week", seconds: 604800 },
		{ unit: "day", seconds: 86400 },
		{ unit: "hour", seconds: 3600 },
		{ unit: "minute", seconds: 60 },
		{ unit: "second", seconds: 1 },
	];

	for (const { unit, seconds } of units) {
		if (Math.abs(diffInSeconds) >= seconds || unit === "second") {
			const value = Math.round(diffInSeconds / seconds);

			if (value === 0) return "just now";

			const abs = Math.abs(value);
			const label = abs === 1 ? unit : `${unit}s`;

			return value > 0 ? `in ${abs} ${label}` : `${abs} ${label} ago`;
		}
	}
}