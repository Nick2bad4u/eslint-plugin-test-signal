# no-vacuous-numeric-assertions

Disallow numeric bound assertions with infinite thresholds.

## Rule details

Assertions such as `expect(count).toBeLessThan(Infinity)` and
`expect(count).toBeGreaterThan(-Infinity)` do not establish a useful behavioral
contract. They usually prove only that the value is being compared against an
unreachable bound instead of the finite threshold the code is expected to meet.

## Incorrect

```ts
it("returns a count", () => {
 expect(loadCount()).toBeLessThan(Infinity);
});
```

```ts
it("returns a count", () => {
 expect(loadCount()).toBeGreaterThan(-Infinity);
});
```

## Correct

```ts
it("returns a bounded count", () => {
 expect(loadCount()).toBeLessThan(10);
});
```

```ts
it("returns at least one item", () => {
 expect(loadCount()).toBeGreaterThanOrEqual(1);
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks where numeric
bound matchers use `Infinity` or `-Infinity` as a vacuous threshold:

- `toBeLessThan(Infinity)`
- `toBeLessThanOrEqual(Infinity)`
- `toBeGreaterThan(-Infinity)`
- `toBeGreaterThanOrEqual(-Infinity)`
- the equivalent negated impossible-bound forms

The rule does not flag exact `toBe(Infinity)` assertions because some tests may
intentionally assert an explicit infinite value.

## Options

This rule has no options.

## When not to use it

Disable this rule only for tests that intentionally document numeric matcher
semantics. Product tests should assert a finite boundary or exact expected
value.

> **Rule catalog ID:** R023
