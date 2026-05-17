import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

const experimentalConfig = plugin.configs?.["experimental"];
const sharedConfigPresetName = ["without", "Type", "fest"].join("");
const sharedConfigPresets =
    /** @type {Record<string, import("eslint").Linter.Config[]>} */ (
        /** @type {unknown} */ (nickTwoBadFourU.configs)
    );

/** @type {import("eslint").Linter.RulesRecord} */
const localExperimentalRules = {};

if (
    !Array.isArray(experimentalConfig) &&
    experimentalConfig?.rules !== undefined
) {
    for (const [ruleName, ruleConfig] of Object.entries(
        experimentalConfig.rules
    )) {
        if (ruleConfig !== undefined) {
            localExperimentalRules[ruleName] = ruleConfig;
        }
    }
}

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...(sharedConfigPresets[sharedConfigPresetName] ?? []),

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{ts,tsx,mts,cts}"],
        name: "Local Test Signal",
        plugins: {
            "test-signal": plugin,
        },
        rules: {
            ...localExperimentalRules,
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
