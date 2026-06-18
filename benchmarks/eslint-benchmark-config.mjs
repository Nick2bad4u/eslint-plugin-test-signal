import tsParser from "@typescript-eslint/parser";
import * as path from "node:path";

import plugin from "../plugin.mjs";

/**
 * @typedef {Record<string, unknown>} UnknownRecord
 */

/**
 * @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules
 */

/**
 * @typedef {{
 *     recommendedFixture: readonly string[];
 *     validFixture: readonly string[];
 * }} BenchmarkFileGlobs
 */

/**
 * @typedef {{ rules: BenchmarkRules }} CreateTestSignalFlatConfigOptions
 */

/**
 * @typedef {{
 *     all: Readonly<BenchmarkRules>;
 *     minimal: Readonly<BenchmarkRules>;
 *     recommended: Readonly<BenchmarkRules>;
 *     strict: Readonly<BenchmarkRules>;
 * }} TestSignalRuleSets
 */

/**
 * @param {unknown} value - Candidate value.
 *
 * @returns {value is UnknownRecord} Whether the value is a non-null object.
 */
const isUnknownRecord = (value) => typeof value === "object" && value !== null;

export const repositoryRoot = path.resolve(process.cwd());

/** @type {Readonly<BenchmarkFileGlobs>} */
export const benchmarkFileGlobs = Object.freeze({
    recommendedFixture: Object.freeze([
        "benchmarks/fixtures/recommended.invalid.ts",
    ]),
    validFixture: Object.freeze(["benchmarks/fixtures/recommended.valid.ts"]),
});

/**
 * @param {unknown} value - Candidate value.
 * @param {string} label - Diagnostic label.
 *
 * @returns {UnknownRecord} Object record.
 *
 * @throws {TypeError} When the candidate value is not a record.
 */
const ensureRecord = (value, label) => {
    if (!isUnknownRecord(value)) {
        throw new TypeError(`${label} must be a non-null object.`);
    }

    return value;
};

/**
 * @param {unknown} value - Candidate rule entry.
 *
 * @returns {boolean} Whether the value can be used as an ESLint rule entry.
 */
const isRuleEntry = (value) =>
    typeof value === "number" ||
    typeof value === "string" ||
    Array.isArray(value);

/**
 * @param {unknown} value - Candidate rules object.
 * @param {string} label - Diagnostic label.
 *
 * @returns {BenchmarkRules} Normalized rules record.
 *
 * @throws {TypeError} When the candidate rules object is malformed.
 */
const ensureRulesRecord = (value, label) => {
    const record = ensureRecord(value, label);
    /** @type {BenchmarkRules} */
    const rulesRecord = {};

    for (const [ruleName, ruleEntry] of Object.entries(record)) {
        if (!isRuleEntry(ruleEntry)) {
            throw new TypeError(
                `${label}.${ruleName} must be a valid ESLint rule entry.`
            );
        }

        rulesRecord[ruleName] = /** @type {BenchmarkRules[string]} */ (
            ruleEntry
        );
    }

    return rulesRecord;
};

/**
 * @param {string} presetName - Preset key from plugin.configs.
 *
 * @returns {Readonly<BenchmarkRules>} Frozen ESLint rules for the preset.
 */
const resolveRuleSet = (presetName) => {
    const configs = ensureRecord(plugin.configs, "plugin.configs");
    const preset = ensureRecord(
        configs[presetName],
        `plugin.configs.${presetName}`
    );
    const rules = ensureRulesRecord(
        preset["rules"],
        `${presetName} preset rules`
    );

    return Object.freeze({ ...rules });
};

/** @type {Readonly<TestSignalRuleSets>} */
export const testSignalRuleSets = Object.freeze({
    all: resolveRuleSet("all"),
    minimal: resolveRuleSet("minimal"),
    recommended: resolveRuleSet("recommended"),
    strict: resolveRuleSet("strict"),
});

/**
 * Create an ESLint flat config for benchmark runs.
 *
 * @param {CreateTestSignalFlatConfigOptions} options - Options containing the
 *   ESLint rule map.
 *
 * @returns {import("eslint").Linter.Config[]} ESLint flat config.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- JSDoc typedefs provide the public contract for this benchmark helper.
export function createTestSignalFlatConfig(options) {
    const { rules } = options;

    return [
        {
            files: ["**/*.{test,spec}.{ts,tsx,mts,cts}"],
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    sourceType: "module",
                    tsconfigRootDir: repositoryRoot,
                },
            },
            name: "benchmark:test-signal",
            plugins: {
                "test-signal": plugin,
            },
            rules,
        },
    ];
}
