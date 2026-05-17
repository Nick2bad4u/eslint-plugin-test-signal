# Getting Started

Install the plugin:

```sh
npm install --save-dev eslint-plugin-test-signal eslint typescript
```

Use a flat config preset:

```ts
import testSignal from "eslint-plugin-test-signal";

export default [testSignal.configs.recommended];
```
