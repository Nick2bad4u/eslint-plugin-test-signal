# Getting Started

Install the plugin with ESLint and TypeScript:

```sh
npm install --save-dev eslint-plugin-test-signal eslint typescript
```

## Flat config

```ts
import testSignal from "eslint-plugin-test-signal";

export default [testSignal.configs.recommended];
```

The preset targets common test file globs:

- `**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}`
- `**/__tests__/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}`

## Custom rules

```ts
import testSignal from "eslint-plugin-test-signal";

export default [
    {
        plugins: {
            "test-signal": testSignal,
        },
        rules: {
            "test-signal/no-snapshot-only-tests": "error",
            "test-signal/require-awaited-async-assertions": "error",
        },
    },
];
```

## Choosing a preset

Start with `recommended` for broad coverage with low noise. Use `strict` when a
project expects every suite to include at least one negative-path case.
