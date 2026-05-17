import { defineConfig } from "eslint-rule-benchmark";

export default defineConfig({
    iterations: 80,
    tests: [
        {
            cases: [
                {
                    testPath: "./cases/no-snapshot-only-tests/baseline.ts",
                },
                {
                    testPath: "./cases/no-snapshot-only-tests/complex.ts",
                },
            ],
            name: "Rule: no-snapshot-only-tests",
            ruleId: "test-signal/no-snapshot-only-tests",
            rulePath: "../src/rules/no-snapshot-only-tests.ts",
            warmup: {
                iterations: 15,
            },
        },
    ],
    timeout: 3000,
    warmup: {
        enabled: true,
        iterations: 20,
    },
});
