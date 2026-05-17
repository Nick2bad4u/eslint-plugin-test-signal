/**
 * @packageDocumentation
 * Vitest coverage for plugin preset wiring.
 */
import { describe, expect, it } from "vitest";

import {
    testSignalConfigMetadataByName,
    testSignalConfigNames,
} from "../src/_internal/test-signal-config-references";
import testSignalPlugin from "../src/plugin";

interface FlatConfigLike {
    files?: unknown;
    languageOptions?: UnknownRecord & {
        parser?: unknown;
        parserOptions?: unknown;
    };
    name?: unknown;
    plugins?: UnknownRecord;
    rules?: UnknownRecord;
}

type UnknownRecord = Record<string, unknown>;

const isObject = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const getConfig = (configName: string): FlatConfigLike | undefined => {
    const config = (testSignalPlugin.configs as UnknownRecord)[configName];

    return isObject(config) ? config : undefined;
};

const getConfigRules = (configName: string): UnknownRecord => {
    const config = getConfig(configName);
    const rules = config?.rules;

    return isObject(rules) ? rules : {};
};

describe("test-signal plugin configs", () => {
    it("exports exactly the supported config keys", () => {
        expect.hasAssertions();

        const keys = Object.keys(testSignalPlugin.configs);

        expect(keys).toHaveLength(testSignalConfigNames.length);
        expect(new Set(keys)).toStrictEqual(new Set(testSignalConfigNames));
    });

    it("registers plugin, parser defaults, and test file globs", () => {
        expect.hasAssertions();

        for (const config of Object.values(
            testSignalPlugin.configs
        ) as FlatConfigLike[]) {
            expect(config).toStrictEqual(
                expect.objectContaining({
                    files: [
                        "**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
                        "**/__tests__/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
                    ],
                    plugins: expect.objectContaining({
                        "test-signal": expect.anything(),
                    }),
                })
            );

            expect(config.languageOptions).toStrictEqual(
                expect.objectContaining({
                    parser: expect.anything(),
                    parserOptions: expect.objectContaining({
                        ecmaVersion: "latest",
                        sourceType: "module",
                    }),
                })
            );
        }
    });

    it("keeps minimal within recommended within strict within all within experimental", () => {
        expect.hasAssertions();

        const minimalRules = getConfigRules("minimal");
        const recommendedRules = getConfigRules("recommended");
        const strictRules = getConfigRules("strict");
        const allRules = getConfigRules("all");
        const experimentalRules = getConfigRules("experimental");

        for (const ruleName of Object.keys(minimalRules)) {
            expect(recommendedRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(recommendedRules)) {
            expect(strictRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(strictRules)) {
            expect(allRules).toHaveProperty(ruleName, "error");
        }

        for (const ruleName of Object.keys(allRules)) {
            expect(experimentalRules).toHaveProperty(ruleName, "error");
        }
    });

    it("enables the intended rule sets", () => {
        expect.hasAssertions();

        expect(getConfigRules("minimal")).toStrictEqual({
            "test-signal/no-empty-async-tests": "error",
            "test-signal/no-focused-tests": "error",
            "test-signal/require-awaited-async-assertions": "error",
        });
        expect(getConfigRules("recommended")).toStrictEqual(
            expect.objectContaining({
                "test-signal/no-conditional-assertions": "error",
                "test-signal/no-disabled-tests": "error",
                "test-signal/no-mock-call-only-tests": "error",
                "test-signal/no-snapshot-only-tests": "error",
                "test-signal/no-weak-truthy-assertions": "error",
                "test-signal/require-assertions": "error",
            })
        );
        expect(getConfigRules("strict")).toHaveProperty(
            "test-signal/require-negative-path",
            "error"
        );
        expect(getConfigRules("strict")).toHaveProperty(
            "test-signal/no-try-catch-assertions",
            "error"
        );
        expect(getConfigRules("strict")).toHaveProperty(
            "test-signal/require-error-message-assertions",
            "error"
        );
    });

    it("keeps parser projectService aligned with preset metadata", () => {
        expect.hasAssertions();

        for (const configName of testSignalConfigNames) {
            const config = getConfig(configName);
            const parserOptions = config?.languageOptions?.parserOptions;
            const hasProjectServiceEnabled =
                isObject(parserOptions) &&
                parserOptions["projectService"] === true;

            expect(hasProjectServiceEnabled).toBe(
                testSignalConfigMetadataByName[configName].requiresTypeChecking
            );
        }
    });
});
