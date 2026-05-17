# no-conditional-assertions

Disallow assertions that only run behind conditional control flow.

## Rule details

Assertions hidden in `if`, `switch`, ternary, or short-circuit branches can pass
without proving the behavior under test. When the branch is not taken, the test
body still completes successfully unless another deterministic assertion fails.

## Incorrect

```ts
it("handles optional metadata", () => {
    const result = readResult();

    if (result.metadata !== undefined) {
        expect(result.metadata.source).toBe("cache");
    }
});
```

## Correct

```ts
it("handles optional metadata", () => {
    const result = readResult();

    expect(result.metadata).toEqual({ source: "cache" });
});
```

```ts
it("handles missing metadata", () => {
    const result = readResultWithoutMetadata();

    expect(result.metadata).toBeUndefined();
});
```

## What this rule reports

This rule reports `expect(...)` assertions inside executable `it(...)` and
`test(...)` callbacks when the assertion is nested in:

- `if` or `else` branches
- `switch` cases
- ternary branches
- the right-hand side of `&&`, `||`, or `??`

Skipped and todo tests are left to `no-disabled-tests`.

## Options

This rule has no options.

## When not to use it

Disable this rule for generated tests that intentionally model multiple branch
outcomes in one runner callback. Hand-written tests should usually split branch
coverage into separate deterministic test cases.

> **Rule catalog ID:** R009
