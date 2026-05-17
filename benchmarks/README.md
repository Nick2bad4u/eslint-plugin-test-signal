# ESLint Benchmark Suite

This directory contains ESLint performance benchmarks for
`eslint-plugin-test-signal`.

The suite measures representative weak-test-signal workloads:

- invalid corpus benchmarks for weak-test patterns;
- valid corpus benchmarks for clean traversal overhead;
- preset-focused benchmarks for `recommended`, `strict`, and `all`.

## Run benchmarks

```bash
npm run bench
```

This runs `benchmarks/run-eslint-stats.mjs` and writes JSON to
`coverage/benchmarks/eslint-stats.json`.

## Rule benchmark conventions

The rule benchmark config is loaded from `benchmark/config.ts` via:

```bash
npm run bench:rule-benchmark
```

Benchmark case files under `benchmark/cases/**` use `.ts` extensions.
