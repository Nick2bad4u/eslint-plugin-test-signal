# no-tautological-length-assertions

Disallow length assertions that only prove length is non-negative.

## Rule details

Array and string lengths are already non-negative. Assertions such as
`expect(items.length).toBeGreaterThanOrEqual(0)` look like coverage, but they do
not prove that the collection has the expected number of items or contents. They
also keep passing when the implementation returns an empty collection.

## Incorrect

```ts
it("returns items", () => {
 expect(loadItems().length).toBeGreaterThanOrEqual(0);
});
```

```ts
it("returns items", () => {
 expect(loadItems().length).not.toBeLessThan(0);
});
```

## Correct

```ts
it("returns two items", () => {
 expect(loadItems()).toHaveLength(2);
});
```

```ts
it("returns at least one item", () => {
 expect(loadItems().length).toBeGreaterThan(0);
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks with
tautological lower-bound checks against `.length`:

- `expect(value.length).toBeGreaterThanOrEqual(0)`
- `expect(value.length).toBeGreaterThan(-1)`
- `expect(value.length).not.toBeLessThan(0)`
- `expect(value.length).not.toBeLessThanOrEqual(-1)`

The rule intentionally does not follow variables or fold arbitrary expressions.
Computed thresholds remain valid because they usually encode a project-specific
contract.

## Options

This rule has no options.

## When not to use it

Disable this rule for unusual tests that intentionally document JavaScript
runtime invariants. Product tests should assert an exact length, a positive
minimum, or expected contents.

> **Rule catalog ID:** R019
