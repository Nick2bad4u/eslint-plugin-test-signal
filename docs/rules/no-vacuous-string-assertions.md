# no-vacuous-string-assertions

Disallow string assertions with expected values that match anything.

## Rule details

Assertions such as `expect(text).toContain("")` and
`expect(text).toMatch(/.*/)` look like string coverage, but they keep passing
for every string value. They do not prove that the code rendered the expected
label, token, error message, or format.

## Incorrect

```ts
it("renders content", () => {
 expect(renderedText()).toContain("");
});
```

```ts
it("renders content", () => {
 expect(renderedText()).toMatch(/.*/);
});
```

```ts
it("renders content", () => {
 expect(renderedText()).toEqual(expect.stringContaining(""));
});
```

## Correct

```ts
it("renders content", () => {
 expect(renderedText()).toContain("Saved");
});
```

```ts
it("renders content", () => {
 expect(renderedText()).toMatch(/^Saved \d+ items$/);
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that use:

- `toContain("")`
- `toMatch(/.*/)`
- `toMatch(/^.*$/)`
- `expect.stringContaining("")` as the direct expected assertion value

The rule intentionally does not evaluate computed strings or regular
expressions. Project-specific constants may encode meaningful expectations.

## Options

This rule has no options.

## When not to use it

Disable this rule only for tests that intentionally document matcher semantics.
Product tests should assert the specific text or format produced by the code
under test.

> **Rule catalog ID:** R022
