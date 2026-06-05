import { LogoProps } from "@/interfaces/ui.interface";
import { Image } from "react-native";

const Logo = ({ size = 58, style }: LogoProps) => {
	return <Image source={require("../../assets/images/logo.png")} resizeMode="contain" style={[{ width: size, height: size }, style]} />;
};

export default Logo;
