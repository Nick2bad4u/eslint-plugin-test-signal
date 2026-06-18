import { ESLint } from "eslint";
import { bench, describe, expect } from "vitest";

import {
    benchmarkFileGlobs,
    createTestSignalFlatConfig,
    testSignalRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     minimumMessageCount: number;
 *     rules: BenchmarkRules;
 * }>} LintScenarioOptions
 *   Scenario configuration for linting a fixture set.
 */

const standardBenchmarkOptions = Object.freeze({
    iterations: 3,
    warmupIterations: 1,
});

/**
 * Count lint problems so benchmark runs assert useful signal.
 *
 * @param {readonly import("eslint").ESLint.LintResult[]} lintResults - ESLint
 *   lint results.
 *
 * @returns {number} Total error + warning count.
 */
const countReportedProblems = (lintResults) =>
    lintResults.reduce(
        (problemCount, result) =>
            problemCount + result.errorCount + result.warningCount,
        0
    );

/**
 * Run one ESLint benchmark scenario.
 *
 * @param {LintScenarioOptions} options - Fixture patterns, rules, and expected
 *   signal limits.
 *
 * @returns {Promise<number>} Problem count.
 */
const lintScenario = async (options) => {
    const eslint = new ESLint({
        baseConfig: createTestSignalFlatConfig({
            rules: options.rules,
        }),
        cache: false,
        fix: options.fix,
        ignore: false,
        overrideConfigFile: true,
        stats: true,
    });

    const results = await eslint.lintFiles([...options.filePatterns]);
    const problemCount = countReportedProblems(results);

    expect(problemCount).toBeGreaterThanOrEqual(options.minimumMessageCount);

    return problemCount;
};

describe("eslint-plugin-test-signal rule benchmarks", () => {
    bench(
        "recommended preset on invalid weak-test fixture",
        async () => {
            expect.hasAssertions();

            await lintScenario({
                filePatterns: benchmarkFileGlobs.recommendedFixture,
                fix: false,
                minimumMessageCount: 1,
                rules: testSignalRuleSets.recommended,
            });
        },
        standardBenchmarkOptions
    );

    bench(
        "recommended preset on valid test fixture",
        async () => {
            expect.hasAssertions();

            await lintScenario({
                filePatterns: benchmarkFileGlobs.validFixture,
                fix: false,
                minimumMessageCount: 0,
                rules: testSignalRuleSets.recommended,
            });
        },
        standardBenchmarkOptions
    );

    bench(
        "strict preset on invalid weak-test fixture",
        async () => {
            expect.hasAssertions();

            await lintScenario({
                filePatterns: benchmarkFileGlobs.recommendedFixture,
                fix: false,
                minimumMessageCount: 1,
                rules: testSignalRuleSets.strict,
            });
        },
        standardBenchmarkOptions
    );
});
