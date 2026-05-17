# no-weak-existence-assertions

Disallow broad existence assertions in executable tests.

## Rule details

Existence checks prove only that a value is not one narrow absence case. They do
not verify the expected boolean, object shape, collection length, status code, or
domain state. A test using `toBeDefined()` or `not.toBeNull()` can keep passing
after the implementation returns the wrong object, an empty collection, `false`,
or another unintended value.

## Incorrect

```ts
it("returns a user", () => {
    expect(loadUser("abc")).toBeDefined();
});
```

```ts
it("returns a user", () => {
    expect(loadUser("abc")).not.toBeNull();
});
```

## Correct

```ts
it("returns a user", () => {
    expect(loadUser("abc")).toEqual({
        enabled: true,
        id: "abc",
    });
});
```

```ts
it("omits missing users", () => {
    expect(loadUser("missing")).toBeUndefined();
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that use broad
existence assertions:

- `expect(value).toBeDefined()`
- `expect(value).not.toBeNull()`
- `expect(value).not.toBeUndefined()`
- promise-modified forms such as
  `await expect(value).resolves.not.toBeUndefined()`

Positive absence assertions such as `toBeNull()` and `toBeUndefined()` remain
valid because they verify a concrete absence state.

## Options

This rule has no options.

## When not to use it

Disable this rule for smoke tests whose only contract is that a framework hook
returns some value. For most product tests, prefer exact booleans, object shapes,
collection lengths, or explicit absence assertions.

> **Rule catalog ID:** R016
