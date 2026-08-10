/**
 * Repository-specific configuration for Knip dependency analysis.
 *
 * @packageDocumentation
 */
import type { KnipConfig } from "knip";

/**
 * Knip configuration that scopes entry points and dependency heuristics to the
 * repository layout.
 */
const knipConfig: KnipConfig = {
    $schema: "https://unpkg.com/knip@5/schema.json",
    entry: [],
    ignore: [
        "docs/docusaurus/src/css/custom.css.d.ts",
        "docs/docusaurus/src/**/*.module.css.d.ts",
        "plugin.d.mts",
        "scripts/*.d.mts",
    ],
    ignoreBinaries: [
        // Python-based native developer prerequisite; the npm package is unrelated.
        "detect-secrets",
        "grype",
        // Lychee is a native developer prerequisite; no official npm CLI package exists.
        "lychee",
        // False-positve Knip thinks knip.config.ts is a binary entry point, but it's actually just a config file.
        "knip.config.ts",
    ],
    ignoreDependencies: [
        // Root config inherited by the docs workspace; React is owned there.
        "react",
        "@microsoft/tsdoc-config",
        // Stryker discovers these configured plugin families dynamically.
        "@stryker-ignorer/*",
        "@stryker-mutator/*",
        // These packages are consumed through config paths or dynamic tool loading.
        "gitcliff-config-nick2bad4u",
        "gitleaks-config-nick2bad4u",
        "jscpd-config-nick2bad4u",
        "lychee-config-nick2bad4u",
        "ncu-config-nick2bad4u",
        "yamllint-config-nick2bad4u",
        // Package names are resolved dynamically by their owning tools.
        "stylelint-formatter-pretty",
        "tsdoc-config-nick2bad4u",
        "@easyops-cn/docusaurus-search-local",
        "@easyops-cn/docusaurus-theme-docusaurus-search-local",
        "typed-css-modules",
        "typedoc-config-nick2bad4u",
        // These are dependencies of stylelint-config-nick2bad4u, not direct imports.
        "@double-great/stylelint-a11y",
        "@stylistic/stylelint-plugin",
        "postcss-html",
        "postcss-scss",
        "postcss-styled-jsx",
        "postcss-styled-syntax",
        "stylelint-config-recess-order",
        "stylelint-config-standard",
        "stylelint-config-standard-scss",
        "stylelint-config-tailwindcss",
        "stylelint-declaration-block-no-ignored-properties",
        "stylelint-declaration-strict-value",
        "stylelint-gamut",
        "stylelint-group-selectors",
        "stylelint-high-performance-animation",
        "stylelint-media-use-custom-media",
        "stylelint-no-browser-hacks",
        "stylelint-no-unsupported-browser-features",
        "stylelint-order",
        "stylelint-plugin-container-query-sanity",
        "stylelint-plugin-css-performance-budget",
        "stylelint-plugin-defensive-css",
        "stylelint-plugin-docusaurus",
        "stylelint-plugin-font",
        "stylelint-plugin-grid",
        "stylelint-plugin-use-baseline",
        "stylelint-prettier",
        "stylelint-scales",
        "stylelint-use-nesting",
        "stylelint-value-no-unknown-custom-properties",
    ],
    ignoreExportsUsedInFile: {
        interface: true,
        type: true,
    },
    includeEntryExports: true,
    project: [],
    rules: {
        binaries: "error",
        catalog: "error",
        dependencies: "error",
        devDependencies: "error",
        duplicates: "error",
        enumMembers: "warn",
        exports: "warn",
        files: "error",
        namespaceMembers: "warn",
        nsExports: "warn",
        nsTypes: "warn",
        optionalPeerDependencies: "error",
        types: "warn",
        unlisted: "error",
        unresolved: "error",
    },
    workspaces: {
        ".": {
            entry: [
                ".secretlintrc.cjs",
                "benchmarks/fixtures/*.ts",
                "src/plugin.ts",
                "vitest.stryker.config.ts",
            ],
            project: [
                "*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "benchmarks/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "scripts/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "src/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "test/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
            ],
        },
    },
};

export default knipConfig;
