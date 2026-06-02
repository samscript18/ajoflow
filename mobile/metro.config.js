const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
	const isReactNativeWebApi =
		context.originModulePath &&
		context.originModulePath.includes(`${path.sep}react-native${path.sep}src${path.sep}private${path.sep}webapis${path.sep}`);

	if (isReactNativeWebApi && moduleName.endsWith("errors/DOMException")) {
		return context.resolveRequest(context, path.join(__dirname, "shims/DOMException.js"), platform);
	}

	if (defaultResolveRequest) {
		return defaultResolveRequest(context, moduleName, platform);
	}

	return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
