/**
 * @packageDocumentation
 * Integration coverage for source-level plugin preset wiring.
 */
import { describe, expect, it, vi } from "vitest";

import {
    testSignalConfigMetadataByName,
    testSignalConfigNames,
} from "../src/_internal/test-signal-config-references";

const loadSourcePlugin = async () => {
    vi.resetModules();
    const pluginModule = await import("../src/plugin");

    return pluginModule.default;
};

describe("source plugin config wiring", () => {
    it("builds layered rule presets from src/plugin", async () => {
        expect.hasAssertions();

        const plugin = await loadSourcePlugin();
        const expectedQualifiedRuleIds = Object.keys(plugin.rules).map(
            (ruleName) => `test-signal/${ruleName}`
        );
        const experimentalRuleIds = Object.keys(
            plugin.configs.experimental.rules
        );

        expect(Object.keys(plugin.configs.minimal.rules)).toHaveLength(3);
        expect(Object.keys(plugin.configs.recommended.rules)).toHaveLength(16);
        expect(Object.keys(plugin.configs.strict.rules)).toHaveLength(21);
        expect(Object.keys(plugin.configs.all.rules)).toHaveLength(21);
        expect(experimentalRuleIds).toStrictEqual(
            expect.arrayContaining(expectedQualifiedRuleIds)
        );

        for (const configName of testSignalConfigNames) {
            expect(plugin.configs[configName].name).toBe(
                testSignalConfigMetadataByName[configName].presetName
            );
        }

        expect(plugin.meta.name).toBe("eslint-plugin-test-signal");
    });

    it("registers parser defaults, files, and plugin namespace", async () => {
        expect.hasAssertions();

        const plugin = await loadSourcePlugin();
        const recommendedConfig = plugin.configs.recommended;

        expect(recommendedConfig.files).toStrictEqual([
            "**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
            "**/__tests__/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
        ]);
        expect(recommendedConfig.plugins).toHaveProperty("test-signal");
        expect(recommendedConfig.plugins?.["test-signal"]).toHaveProperty(
            "rules"
        );
        expect(recommendedConfig.languageOptions).toHaveProperty("parser");
        expect(recommendedConfig.languageOptions).toHaveProperty(
            "parserOptions"
        );
        expect(
            recommendedConfig.languageOptions?.["parserOptions"]
        ).toStrictEqual({
            ecmaVersion: "latest",
            sourceType: "module",
        });
    });
});
