# no-empty-async-tests

Disallow async tests that never execute an assertion.

## Rule details

An `async` test without assertions can pass because the callback completes, not
because behavior was checked. This is especially risky after refactors that
remove the final `expect(...)` call but leave the async wrapper behind.

## Incorrect

```ts
it("loads the account", async () => {
 await loadAccount("user-1");
});
```

## Correct

```ts
it("loads the account", async () => {
 await expect(loadAccount("user-1")).resolves.toMatchObject({
  id: "user-1",
 });
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` calls when the callback is
`async` and the callback body contains no `expect(...)` assertions.

Skipped and todo tests are ignored.

## Options

This rule has no options.

## When not to use it

Disable this rule for test styles that intentionally assert only by throwing and
where that convention is enforced by another tool.

> **Rule catalog ID:** R001
