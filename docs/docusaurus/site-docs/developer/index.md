# Developer Guide

`eslint-plugin-test-signal` is organized around static rule metadata, focused
AST helpers, and generated docs surfaces that must stay synchronized with the
runtime plugin export.

Source code lives in `src/`, rules live in `src/rules/`, shared rule utilities
live in `src/_internal/`, rule docs live in `docs/rules/`, and the Docusaurus
site lives in `docs/docusaurus/`.

## Rule development checklist

New rules should update the same surfaces as existing rules:

- Add the rule implementation in `src/rules/`.
- Register it through the internal rule registry and catalog.
- Add rule docs in `docs/rules/`.
- Add `RuleTester` coverage in `test/`.
- Wire the rule into the correct presets.
- Run the sync scripts before validating docs or release output.

Run the standard verification commands from the repository root:

```sh
npm run build
npm run typecheck
npm run test
npm run sync:rules:check
npm run docs:build
```

Use `npm run release:verify` as the final release gate when source, docs,
generated metadata, or package surfaces change.
