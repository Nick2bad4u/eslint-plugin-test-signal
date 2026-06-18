# require-negative-path

Require test files and suites to include at least one negative-path coverage
signal.

## Rule details

A suite that only exercises successful paths can miss validation gaps, rejection
handling, and error reporting. This rule reports a test scope when none of its
tests indicate failure-path coverage.

The rule treats the following as negative-path signals:

- titles containing words such as `throws`, `rejects`, `invalid`, `missing`,
  `without`, `error`, or `fails`;
- `.rejects` assertion chains;
- `.not` assertion chains;
- common failure-oriented matchers such as `toThrow()`.

## Incorrect

```ts
describe("parseToken", () => {
 it("parses valid tokens", () => {
  expect(parseToken("abc")).toEqual({ value: "abc" });
 });
});
```

## Correct

```ts
describe("parseToken", () => {
 it("parses valid tokens", () => {
  expect(parseToken("abc")).toEqual({ value: "abc" });
 });

 it("throws for invalid tokens", () => {
  expect(() => parseToken("")).toThrow("Invalid token");
 });
});
```

## What this rule reports

This rule reports executable `describe(...)` scopes and top-level test files that
contain tests but no negative-path signal.

## Options

This rule has no options.

## When not to use it

Disable this rule for generated conformance suites or single-purpose smoke tests
where negative behavior is covered by a separate file.

> **Rule catalog ID:** R005
