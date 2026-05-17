# Adoption Checklist

Use `minimal` first on existing test suites, then move to `recommended` after
async assertion issues are fixed.

1. Enable `testSignal.configs.minimal`.
2. Fix floating `.resolves` and `.rejects` assertions.
3. Remove or assert empty async tests.
4. Enable `testSignal.configs.recommended`.
5. Add explicit behavior assertions to snapshot-only and mock-call-only tests.
6. Trial `testSignal.configs.strict` on high-value packages.
