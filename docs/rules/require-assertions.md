# require-assertions

Require every executable test to include at least one assertion.

## Rule details

A test that only calls the subject can pass even when it proves no observable
behavior. These tests often survive refactors because they exercise code paths
without checking return values, thrown errors, emitted events, or state changes.

## Incorrect

```ts
it("renders compact mode", () => {
 renderWidget({ mode: "compact" });
});
```

## Correct

```ts
it("renders compact mode", () => {
 expect(renderWidget({ mode: "compact" }).mode).toBe("compact");
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that do not
contain an `expect(...)` assertion. Skipped and todo tests are left to
`no-disabled-tests`.

## Options

This rule has no options.

## When not to use it

Disable this rule for integration suites where the test runner itself performs
assertions outside the test body, such as generated contract tests with external
golden-file validation.

> **Rule catalog ID:** R008
