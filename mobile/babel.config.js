module.exports = function (api) {
	api.cache(true);

	return {
		presets: [[require.resolve("expo/node_modules/babel-preset-expo"), { jsxImportSource: "nativewind" }], "nativewind/babel"],
		plugins: [
			"@babel/plugin-transform-flow-strip-types",
			["@babel/plugin-transform-class-properties", { loose: true }],
			["@babel/plugin-transform-private-methods", { loose: true }],
			["@babel/plugin-transform-private-property-in-object", { loose: true }],
			"react-native-reanimated/plugin",
		],
	};
};
