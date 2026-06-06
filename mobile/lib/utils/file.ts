export function getFileName(uri: string) {
	const fallback = `profile-${Date.now()}.jpg`;
	return uri.split("/").pop()?.split("?")[0] || fallback;
}

export function getMimeType(uri: string) {
	const extension = getFileName(uri).split(".").pop()?.toLowerCase();

	if (extension === "png") return "image/png";
	if (extension === "webp") return "image/webp";
	if (extension === "heic") return "image/heic";
	return "image/jpeg";
}
