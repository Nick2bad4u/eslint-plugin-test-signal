# no-focused-tests

Disallow focused tests and suites.

## Rule details

Focused tests are useful while debugging, but they are dangerous in committed
code. A focused test runs only part of the suite, so failures in neighboring
tests can disappear from local runs and CI jobs that reuse the same command.

## Incorrect

```ts
it.only("handles valid input", () => {
 expect(parseConfig("enabled")).toBe(true);
});
```

## Correct

```ts
it("handles valid input", () => {
 expect(parseConfig("enabled")).toBe(true);
});
```

## What this rule reports

This rule reports focused Jest/Vitest-style test and suite declarations such as
`it.only(...)`, `test.only(...)`, `describe.only(...)`, `fit(...)`, and
`fdescribe(...)`.

## Options

This rule has no options.

## When not to use it

Do not disable this rule for committed test code. Keep focused tests in local
debugging sessions only.

> **Rule catalog ID:** R006
