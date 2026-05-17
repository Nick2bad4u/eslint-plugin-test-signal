/**
 * @packageDocumentation
 * Vitest coverage for plugin entrypoint behavior.
 */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { testSignalConfigNames } from "../src/_internal/test-signal-config-references";
import testSignalPlugin from "../src/plugin";

const requireFromTestModule = createRequire(import.meta.url);
const packageJson = requireFromTestModule("../package.json") as {
    version: string;
};
const expectedPluginVersion = packageJson.version;

const expectedRuleRegistryShape = expect.objectContaining({
    "no-empty-async-tests": expect.any(Object),
    "no-mock-call-only-tests": expect.any(Object),
    "no-snapshot-only-tests": expect.any(Object),
    "require-awaited-async-assertions": expect.any(Object),
    "require-negative-path": expect.any(Object),
});

describe("plugin entry module", () => {
    it("exports default plugin object with rule and config registries", () => {
        expect.hasAssertions();

        expect(testSignalPlugin).toStrictEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                meta: expect.any(Object),
                processors: expect.any(Object),
                rules: expect.any(Object),
            })
        );

        expect(testSignalPlugin.meta).toStrictEqual(
            expect.objectContaining({
                name: "eslint-plugin-test-signal",
                namespace: "test-signal",
                version: expectedPluginVersion,
            })
        );
    });

    it("exposes supported presets and rule registrations", () => {
        expect.hasAssertions();

        expect(Object.keys(testSignalPlugin.configs)).toStrictEqual([
            ...testSignalConfigNames,
        ]);
        expect(testSignalPlugin.rules).toStrictEqual(expectedRuleRegistryShape);
    });

    it("exports matching runtime plugin shape from plugin.mjs", async () => {
        expect.hasAssertions();

        const runtimePluginModule = await import("../plugin.mjs");

        expect(runtimePluginModule.default).toStrictEqual(
            expect.objectContaining({
                meta: expect.objectContaining({
                    name: "eslint-plugin-test-signal",
                    namespace: "test-signal",
                    version: expectedPluginVersion,
                }),
                rules: expectedRuleRegistryShape,
            })
        );
    });

    it("exports matching runtime plugin shape from dist/plugin.cjs", () => {
        expect.hasAssertions();

        const runtimePlugin = requireFromTestModule("../dist/plugin.cjs") as {
            meta?: {
                name?: unknown;
                namespace?: unknown;
                version?: unknown;
            };
            rules?: unknown;
        };

        expect(runtimePlugin).toStrictEqual(
            expect.objectContaining({
                meta: expect.objectContaining({
                    name: "eslint-plugin-test-signal",
                    namespace: "test-signal",
                    version: expectedPluginVersion,
                }),
                rules: expectedRuleRegistryShape,
            })
        );
    });
});
