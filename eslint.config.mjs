import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

const testSignalConfigs =
    /** @type {Record<string, import("eslint").Linter.Config>} */ (
        /** @type {unknown} */ (plugin.configs)
    );
const localTestSignalRules = testSignalConfigs["all"]?.rules ?? {};

/** @type {import("eslint").Linter.Config[]} */
const config = [
    {
        ignores: [
            "benchmark/**",
            "benchmarks/**",
            "docs/docusaurus/typedoc-plugins/**",
            "knip.config.ts",
            "plugin.d.mts",
            "temp/**",
            "vitest.stryker.config.ts",
        ],
        name: "Generated and Non-Project Tooling Ignores",
    },
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
            "canonical/filename-no-index": "off",
            "n/no-process-env": "off",
            "sonarjs/no-implicit-dependencies": "off",
            "unicorn/filename-case": "off",
            "unicorn/no-non-function-verb-prefix": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/prefer-short-arrow-method": "off",
            "unicorn/prefer-temporal": "off",
        },
    },
    {
        files: ["docs/docusaurus/**/*.css"],
        name: "Docusaurus CSS Stylelint Bridge",
        rules: {
            // Dedicated stylelint runs keep these as warnings; the ESLint bridge treats them as errors.
            "stylelint-2/stylelint": "off",
        },
    },
    {
        files: ["docs/docusaurus/src/js/modernEnhancements.ts"],
        name: "Docusaurus Client Enhancements",
        rules: {
            "@typescript-eslint/no-dynamic-delete": "off",
            "listeners/no-missing-remove-event-listener": "off",
            "unicorn/no-break-in-nested-loop": "off",
            "unicorn/no-global-object-property-assignment": "off",
            "unicorn/no-incorrect-template-string-interpolation": "off",
            "unicorn/no-unnecessary-global-this": "off",
        },
    },
    {
        files: ["docs/docusaurus/sidebars.rules.ts"],
        name: "Docusaurus Sidebar Generation",
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "n/no-sync": "off",
            "unicorn/prefer-import-meta-properties": "off",
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
        files: [
            "src/_internal/rules-registry.ts",
            "src/_internal/rule-catalog.ts",
            "src/_internal/rule-docs-metadata.ts",
            "src/_internal/test-ast.ts",
            "src/rules/**/*.ts",
        ],
        name: "Plugin Rule Implementation Compatibility",
        rules: {
            "import-x/max-dependencies": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/no-declarations-before-early-exit": "off",
            "unicorn/prefer-includes-over-repeated-comparisons": "off",
        },
    },
    {
        files: ["stryker.config.mjs", "vite.config.ts"],
        name: "Tooling Config Runtime Values",
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "unicorn/prefer-number-coercion": "off",
        },
    },
    {
        files: [
            "test/**/*.ts",
            "test/**/*.mts",
            "test/**/*.cts",
        ],
        name: "Vitest Harness Compatibility",
        rules: {
            "unicorn/consistent-boolean-name": "off",
            "unicorn/max-nested-calls": "off",
            "unicorn/no-declarations-before-early-exit": "off",
            "unicorn/no-top-level-side-effects": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/prefer-iterator-to-array": "off",
            "unicorn/prefer-number-coercion": "off",
            "unicorn/prefer-number-is-safe-integer": "off",
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
