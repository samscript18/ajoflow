const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PODFILE_HEADER = "target 'AjoFlow' do";
const MODULAR_HEADERS_LINE = "  use_modular_headers!";

const withModularHeaders = (config) =>
	withDangerousMod(config, [
		"ios",
		async (config) => {
			const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
			let podfile = fs.readFileSync(podfilePath, "utf8");

			if (!podfile.includes(MODULAR_HEADERS_LINE)) {
				podfile = podfile.replace(PODFILE_HEADER, `${PODFILE_HEADER}\n${MODULAR_HEADERS_LINE}`);
				fs.writeFileSync(podfilePath, podfile);
			}

			return config;
		},
	]);

module.exports = withModularHeaders;
