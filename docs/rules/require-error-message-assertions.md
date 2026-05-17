# require-error-message-assertions

Require throw and rejection assertions to verify the expected error.

## Rule details

`toThrow()` without an expected message, constructor, pattern, or shape only
proves that some exception occurred. That leaves negative-path tests vulnerable
to passing when the code throws for the wrong reason, such as an unrelated
validation failure or a regression in setup.

## Incorrect

```ts
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrow();
});
```

```ts
it("rejects missing users", async () => {
    await expect(loadUser("missing")).rejects.toThrow();
});
```

## Correct

```ts
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrow("Token is required");
});
```

```ts
it("rejects missing users", async () => {
    await expect(loadUser("missing")).rejects.toThrow("Missing user");
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that call
`toThrow()` or `toThrowError()` with no expected error argument. It does not
report `not.toThrow()` because that assertion verifies that no error is thrown.

Skipped and todo tests are left to `no-disabled-tests`.

## Options

This rule has no options.

## When not to use it

Disable this rule for smoke tests where the exact error is intentionally
irrelevant. Public behavior tests should usually assert the error message,
constructor, pattern, or object shape.

> **Rule catalog ID:** R012
