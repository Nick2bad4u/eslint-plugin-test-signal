import {
    createTestSignalFlatConfig,
    testSignalRuleSets,
} from "./eslint-benchmark-config.mjs";

/**
 * Benchmark-oriented ESLint flat config for CLI TIMING/--stats runs.
 */
/** @type {import("eslint").Linter.Config[]} */
const benchmarkTimingConfig = createTestSignalFlatConfig({
    rules: testSignalRuleSets.recommended,
});

export default benchmarkTimingConfig;
