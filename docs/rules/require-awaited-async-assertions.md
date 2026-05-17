# require-awaited-async-assertions

Require Promise-based `.resolves` and `.rejects` assertions to be awaited or
returned.

## Rule details

Floating Promise assertions let a test finish before the matcher observes the
settled value. The test can pass even when the Promise rejects unexpectedly or
the assertion would fail on the next microtask.

## Incorrect

```ts
it("rejects invalid tokens", () => {
    expect(readToken("bad")).rejects.toThrow("Invalid token");
});
```

## Correct

```ts
it("rejects invalid tokens", async () => {
    await expect(readToken("bad")).rejects.toThrow("Invalid token");
});
```

## Also correct

```ts
it("resolves valid tokens", () => {
    return expect(readToken("ok")).resolves.toEqual({ value: "ok" });
});
```

## What this rule reports

This rule reports `expect(...).resolves...` and `expect(...).rejects...` chains
that are used as floating expression statements instead of being awaited or
returned.

## Options

This rule has no options.

## When not to use it

Do not disable this rule unless another lint rule already enforces returned or
awaited Promise assertions.

> **Rule catalog ID:** R002
