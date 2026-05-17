# no-identical-expected-actual

Disallow assertions that compare a value to itself.

## Rule details

Self-comparisons are tautologies. They can survive copy/paste mistakes and keep
passing even when the code under test returns the wrong value. The assertion
looks specific, but the expected value is not independent from the actual value.

## Incorrect

```ts
it("returns the saved user", () => {
    const user = saveUser({ id: "abc" });

    expect(user).toEqual(user);
});
```

```ts
it("returns the current state", () => {
    expect(store.state.current).toStrictEqual(store.state.current);
});
```

## Correct

```ts
it("returns the saved user", () => {
    expect(saveUser({ id: "abc" })).toEqual({
        id: "abc",
    });
});
```

```ts
it("returns the current state", () => {
    const expectedState = createExpectedState();

    expect(store.state.current).toStrictEqual(expectedState);
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks where equality
or shape matchers compare the assertion subject to the same source expression:

- `expect(value).toBe(value)`
- `expect(value).toEqual(value)`
- `expect(value).toStrictEqual(value)`
- `expect(value).toMatchObject(value)`

The check is intentionally syntax-level. Aliases such as
`const expected = value; expect(value).toEqual(expected)` are not reported
because proving alias identity would require type and control-flow analysis that
is too noisy for this rule.

## Options

This rule has no options.

## When not to use it

This rule is intended for normal product tests. Disable it for unusual
meta-tests that intentionally verify custom matcher behavior with tautological
inputs.

> **Rule catalog ID:** R017
