# no-try-catch-assertions

Disallow assertions inside `catch` blocks.

## Rule details

Assertions inside `catch` blocks only run when the `try` block throws. If the
code under test unexpectedly resolves or returns, the `catch` body is skipped
and the test can pass without checking the failure path.

## Incorrect

```ts
it("rejects invalid payloads", async () => {
    try {
        await submitPayload({});
    } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
    }
});
```

## Correct

```ts
it("rejects invalid payloads", async () => {
    await expect(submitPayload({})).rejects.toThrow(ValidationError);
});
```

```ts
it("keeps validation details", async () => {
    let caught: unknown;

    try {
        await submitPayload({});
    } catch (error) {
        caught = error;
    }

    expect(caught).toMatchObject({ code: "invalid_payload" });
});
```

## What this rule reports

This rule reports `expect(...)` assertions inside `catch` blocks within
executable `it(...)` and `test(...)` callbacks. It does not report assertions
after the catch block, which makes the test fail normally when no error was
captured.

Skipped and todo tests are left to `no-disabled-tests`.

## Options

This rule has no options.

## When not to use it

Disable this rule for runner-specific tests where the framework guarantees that
the `catch` body is reached before the assertion can run. Most async rejection
tests should prefer `await expect(promise).rejects...`.

> **Rule catalog ID:** R010
