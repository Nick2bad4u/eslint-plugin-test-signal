# no-synthetic-promise-assertions

Disallow `.resolves` and `.rejects` assertions against synthetic Promise values.

## Rule details

`expect(Promise.resolve(...)).resolves` and
`expect(Promise.reject(...)).rejects` usually test JavaScript's built-in Promise
behavior instead of the code under test. These assertions can make an async test
look meaningful while never exercising the production function, adapter, or
error path that should return the promise.

## Incorrect

```ts
it("resolves", async () => {
    await expect(Promise.resolve("ok")).resolves.toBe("ok");
});
```

```ts
it("rejects", async () => {
    await expect(Promise.reject(new Error("boom"))).rejects.toThrow("boom");
});
```

## Correct

```ts
it("loads the user", async () => {
    await expect(loadUser("user-1")).resolves.toEqual({ id: "user-1" });
});
```

```ts
it("rejects invalid input", async () => {
    await expect(saveUser({ id: "" })).rejects.toThrow("id is required");
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks where an
assertion chain combines `.resolves` or `.rejects` with an `expect(...)` subject
that is directly created by `Promise.resolve(...)` or `Promise.reject(...)`.

The rule intentionally does not flag non-global promise-like factories such as
`promiseFactory.resolve(...)`. Those helpers may be part of the behavior under
test in a specific codebase.

## Options

This rule has no options.

## When not to use it

Disable this rule only for tests that intentionally document JavaScript Promise
semantics. Product tests should assert a promise returned by the unit under test.

> **Rule catalog ID:** R021
