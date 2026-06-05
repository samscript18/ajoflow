import { RemoteArtworkProps } from "@/interfaces/ui.interface";
import { Image } from "expo-image";

const toCloudinaryPng = (uri: string) => {
	if (!uri.includes("res.cloudinary.com") || !uri.includes("/image/upload/")) return uri;
	if (uri.includes("/image/upload/f_png")) return uri;
	return uri.replace("/image/upload/", "/image/upload/f_png,q_auto/");
};

export default function RemoteArtwork({ uri, width, height, className, style }: RemoteArtworkProps) {
	return <Image source={{ uri: toCloudinaryPng(uri) }} contentFit="contain" transition={520} className={className} style={[{ width, height }, style]} />;
}
