/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./providers/**/*.{js,jsx,ts,tsx}", "./hooks/**/*.{js,jsx,ts,tsx}", "./store/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 30, "4xl": 36, "5xl": 48, "6xl": 60 },
			fontFamily: {
				manrope: ["Manrope"],
			},
		},
	},
	plugins: [],
};
