# Validation Pipeline

Use this flow when changing rule behavior, docs, presets, or site assets.

```mermaid
flowchart TD
    edit[Edit source, tests, docs, or site assets]
    build[npm run build]
    tests[npm run test]
    typecheck[npm run typecheck]
    sync[npm run sync:rules:check]
    docs[npm run docs:build]
    lint[npm run lint:nocache]
    release[npm run release:verify]

    edit --> build
    build --> tests
    tests --> typecheck
    typecheck --> sync
    sync --> docs
    docs --> lint
    lint --> release
```

`release:verify` is the final check because it exercises package build, lint,
typecheck, tests, docs link validation, sync validation, and package validation
in the same path used before publishing.
