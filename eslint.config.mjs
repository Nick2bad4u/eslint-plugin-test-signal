import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

const testSignalConfigs =
    /** @type {Record<string, import("eslint").Linter.Config>} */ (
        /** @type {unknown} */ (plugin.configs)
    );
const localTestSignalRules = testSignalConfigs["all"]?.rules ?? {};

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.withoutTestSignal,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{ts,tsx,mts,cts}"],
        name: "Local Test Signal",
        plugins: {
            "test-signal": plugin,
        },
        rules: {
            ...localTestSignalRules,
        },
    },
    {
        files: ["docs/docusaurus/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
        languageOptions: {
            globals: {
                AbortController: "readonly",
                clearTimeout: "readonly",
                document: "readonly",
                HTMLElement: "readonly",
                location: "readonly",
                MutationObserver: "readonly",
                process: "readonly",
                setTimeout: "readonly",
                window: "readonly",
            },
        },
        name: "Docusaurus Workspace Resolution",
        rules: {
            // The docs site is an npm workspace with its own package.json dependencies.
            "sonarjs/no-implicit-dependencies": "off",
        },
    },
    {
        files: ["docs/docusaurus/typedoc-plugins/**/*.mjs"],
        name: "Typedoc Plugin Control Flow",
        rules: {
            "sonarjs/elseif-without-else": "off",
        },
    },
    {
        files: ["scripts/**/*.mjs"],
        name: "Maintenance Script Control Flow",
        rules: {
            "sonarjs/too-many-break-or-continue-in-loop": "off",
        },
    },
    {
        files: ["scripts/remark-lint-rule-doc-headings.mjs"],
        name: "Rule Docs Heading Validator Complexity",
        rules: {
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/cyclomatic-complexity": "off",
            "sonarjs/no-undefined-assignment": "off",
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
