import { ESLint } from "eslint";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import pc from "picocolors";

import {
    benchmarkFileGlobs,
    createTestSignalFlatConfig,
    repositoryRoot,
    testSignalRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * @typedef {import("eslint").Linter.RulesRecord} BenchmarkRules
 */

/**
 * @typedef {Record<string, unknown>} UnknownRecord
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: readonly string[];
 *     fix: boolean;
 *     maximumMessageCount?: number;
 *     minimumMessageCount?: number;
 *     name: string;
 *     rules: BenchmarkRules;
 * }>} BenchmarkScenario
 */

/**
 * @typedef {Readonly<{
 *     filePatterns: string[];
 *     fix: boolean;
 *     iterations: number;
 *     messageCount: number;
 *     name: string;
 *     wallClock: {
 *         maxMilliseconds: number;
 *         meanMilliseconds: number;
 *         medianMilliseconds: number;
 *         minMilliseconds: number;
 *     };
 *     warmupIterations: number;
 * }>} ScenarioResult
 */

const defaultIterations = 3;
const defaultMaximumMessageCount = Number.POSITIVE_INFINITY;
const defaultMinimumMessageCount = 1;
const defaultWarmupIterations = 1;

/**
 * @param {unknown} value - Candidate value.
 *
 * @returns {value is UnknownRecord} Whether the value is a non-null record.
 */
const isUnknownRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/** @type {readonly BenchmarkScenario[]} */
const benchmarkScenarios = Object.freeze([
    {
        filePatterns: benchmarkFileGlobs.recommendedFixture,
        fix: false,
        name: "recommended-invalid-fixture",
        rules: testSignalRuleSets.recommended,
    },
    {
        filePatterns: benchmarkFileGlobs.validFixture,
        fix: false,
        maximumMessageCount: 0,
        minimumMessageCount: 0,
        name: "recommended-valid-fixture",
        rules: testSignalRuleSets.recommended,
    },
    {
        filePatterns: benchmarkFileGlobs.recommendedFixture,
        fix: false,
        name: "strict-invalid-fixture",
        rules: testSignalRuleSets.strict,
    },
    {
        filePatterns: benchmarkFileGlobs.recommendedFixture,
        fix: false,
        name: "all-invalid-fixture",
        rules: testSignalRuleSets.all,
    },
]);

/**
 * Parse an integer argument in `--key=value` form.
 *
 * @param {string} key - CLI key without the leading dashes.
 * @param {number} fallback - Fallback value.
 *
 * @returns {number} Parsed positive integer.
 */
const parsePositiveIntegerArgument = (key, fallback) => {
    const prefix = `--${key}=`;
    const rawValue = process.argv.find((argument) =>
        argument.startsWith(prefix)
    );

    if (rawValue === undefined) {
        return fallback;
    }

    const parsed = Number.parseInt(rawValue.slice(prefix.length), 10);

    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Resolve an optional CLI path argument.
 *
 * @param {string} key - CLI key without the leading dashes.
 *
 * @returns {string | undefined} Absolute resolved path.
 */
const parsePathArgument = (key) => {
    const prefix = `--${key}=`;
    const rawValue = process.argv.find((argument) =>
        argument.startsWith(prefix)
    );

    return rawValue === undefined
        ? undefined
        : path.resolve(repositoryRoot, rawValue.slice(prefix.length));
};

/**
 * Count lint problems across results.
 *
 * @param {readonly import("eslint").ESLint.LintResult[]} lintResults - ESLint lint results.
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
 * Sum numeric measurements without relying on runtime APIs missing from the local JS type model.
 *
 * @param {readonly number[]} values - Measurements to sum.
 *
 * @returns {number} Sum of every measurement.
 */
const sumNumbers = (values) => {
    let total = 0;

    // eslint-disable-next-line math/prefer-math-sum-precise -- Math.sumPrecise is not exposed by the current TypeScript JS lib used for typecheck.
    for (const value of values) {
        total += value;
    }

    return total;
};

/**
 * Return the median for a non-empty list of numbers.
 *
 * @param {readonly number[]} values - Number values.
 *
 * @returns {number} Median value.
 *
 * @throws {TypeError} When the list is empty or missing an even-pair value.
 */
const median = (values) => {
    const sortedValues = values.toSorted((left, right) => left - right);
    const middleIndex = Math.floor(sortedValues.length / 2);
    const middleValue = sortedValues[middleIndex];

    if (middleValue === undefined) {
        throw new TypeError("Cannot calculate a median for an empty list.");
    }

    if (sortedValues.length % 2 === 1) {
        return middleValue;
    }

    const previousValue = sortedValues[middleIndex - 1];

    if (previousValue === undefined) {
        throw new TypeError("Cannot calculate an even median without pairs.");
    }

    return (previousValue + middleValue) / 2;
};

/**
 * Run a benchmark scenario once.
 *
 * @param {BenchmarkScenario} scenario - Scenario definition.
 *
 * @returns {Promise<{ messageCount: number; wallClockMilliseconds: number }>} Measurement.
 */
const runScenarioOnce = async (scenario) => {
    const eslint = new ESLint({
        baseConfig: createTestSignalFlatConfig({
            rules: scenario.rules,
        }),
        cache: false,
        fix: scenario.fix,
        ignore: false,
        overrideConfigFile: true,
        stats: true,
    });

    const startedAt = performance.now();
    const lintResults = await eslint.lintFiles([...scenario.filePatterns]);
    const wallClockMilliseconds = performance.now() - startedAt;

    return {
        messageCount: countReportedProblems(lintResults),
        wallClockMilliseconds,
    };
};

/**
 * Run one benchmark scenario with warmup and measured iterations.
 *
 * @param {BenchmarkScenario} scenario - Scenario definition.
 * @param {number} iterations - Measured iteration count.
 * @param {number} warmupIterations - Warmup iteration count.
 *
 * @returns {Promise<ScenarioResult>} Scenario result.
 */
const runScenario = async (scenario, iterations, warmupIterations) => {
    for (let index = 0; index < warmupIterations; index += 1) {
        await runScenarioOnce(scenario);
    }

    const wallClockMeasurements = [];
    let messageCount = 0;

    for (let index = 0; index < iterations; index += 1) {
        const measurement = await runScenarioOnce(scenario);
        wallClockMeasurements.push(measurement.wallClockMilliseconds);
        messageCount = measurement.messageCount;
    }

    const minimumMessageCount =
        scenario.minimumMessageCount ?? defaultMinimumMessageCount;
    const maximumMessageCount =
        scenario.maximumMessageCount ?? defaultMaximumMessageCount;

    if (
        messageCount < minimumMessageCount ||
        messageCount > maximumMessageCount
    ) {
        throw new Error(
            `${scenario.name} reported ${String(messageCount)} messages; expected between ${String(minimumMessageCount)} and ${String(maximumMessageCount)}.`
        );
    }

    const meanMilliseconds =
        sumNumbers(wallClockMeasurements) / wallClockMeasurements.length;

    return {
        filePatterns: [...scenario.filePatterns],
        fix: scenario.fix,
        iterations,
        messageCount,
        name: scenario.name,
        wallClock: {
            maxMilliseconds: Math.max(...wallClockMeasurements),
            meanMilliseconds,
            medianMilliseconds: median(wallClockMeasurements),
            minMilliseconds: Math.min(...wallClockMeasurements),
        },
        warmupIterations,
    };
};

const iterations = parsePositiveIntegerArgument("iterations", defaultIterations);
const warmupIterations = parsePositiveIntegerArgument(
    "warmup",
    defaultWarmupIterations
);
const comparePath = parsePathArgument("compare");
const outputPath = parsePathArgument("output") ?? path.resolve(
    repositoryRoot,
    "coverage/benchmarks/eslint-stats.json"
);

/** @type {ScenarioResult[]} */
const scenarioResults = [];

for (const scenario of benchmarkScenarios) {
    console.log(pc.cyan(`Running ${scenario.name}...`));
    scenarioResults.push(
        await runScenario(scenario, iterations, warmupIterations)
    );
}

const report = {
    generatedAt: new Date().toISOString(),
    iterations,
    scenarios: scenarioResults,
    warmupIterations,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.table(
    scenarioResults.map((scenarioResult) => ({
        meanMs: scenarioResult.wallClock.meanMilliseconds.toFixed(2),
        messages: scenarioResult.messageCount,
        scenario: scenarioResult.name,
    }))
);

if (comparePath !== undefined) {
    const previousReportText = await readFile(comparePath, "utf8");
    const previousReport = /** @type {unknown} */ (
        JSON.parse(previousReportText)
    );
    const previousScenariosValue = isUnknownRecord(previousReport)
        ? previousReport["scenarios"]
        : undefined;
    /** @type {readonly UnknownRecord[]} */
    const previousScenarios = Array.isArray(previousScenariosValue)
        ? previousScenariosValue.filter((scenario) =>
              isUnknownRecord(scenario)
          )
        : [];
    const previousMeanByName = new Map(
        previousScenarios
            .filter((scenario) => typeof scenario["name"] === "string")
            .map((scenario) => [
                scenario["name"],
                isUnknownRecord(scenario["wallClock"])
                    ? scenario["wallClock"]["meanMilliseconds"]
                    : undefined,
            ])
    );

    console.log(pc.bold("\nComparison against previous report:"));
    console.table(
        scenarioResults.map((scenarioResult) => {
            const previousMean = previousMeanByName.get(scenarioResult.name);
            const currentMean = scenarioResult.wallClock.meanMilliseconds;

            return {
                deltaMs:
                    typeof previousMean === "number"
                        ? (currentMean - previousMean).toFixed(2)
                        : "n/a",
                meanMs: currentMean.toFixed(2),
                scenario: scenarioResult.name,
            };
        })
    );
}

console.log(pc.green(`Benchmark report written to ${outputPath}`));
