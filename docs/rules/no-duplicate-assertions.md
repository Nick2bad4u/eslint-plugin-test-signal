# no-duplicate-assertions

Disallow repeated identical assertion chains in the same test.

## Rule details

Repeating the exact same assertion in one test does not add coverage. It usually
signals copy-paste drift where the second assertion was meant to check a
different field, expected value, or post-action state.

## Incorrect

```ts
it("returns user metadata", () => {
    const user = loadUser();

    expect(user.id).toBe("user-1");
    expect(user.id).toBe("user-1");
});
```

## Correct

```ts
it("returns user metadata", () => {
    const user = loadUser();

    expect(user.id).toBe("user-1");
    expect(user.name).toBe("Ada");
});
```

```ts
it("checks state transitions", () => {
    expect(store.getState()).toBe("idle");
    store.load();
    expect(store.getState()).toBe("loaded");
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that contain
the same assertion chain more than once. Whitespace is ignored when comparing
assertions, but the rule does not attempt semantic alias analysis.

Nested helper functions are ignored so reusable assertion helpers can keep their
own local structure.

## Options

This rule has no options.

## When not to use it

Disable this rule for tests that intentionally repeat the same assertion around
side effects to document invariants. In most cases, use a distinct expected
value or assertion subject instead.

> **Rule catalog ID:** R025
