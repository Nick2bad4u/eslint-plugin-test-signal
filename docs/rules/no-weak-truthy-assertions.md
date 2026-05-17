# no-weak-truthy-assertions

Disallow broad truthy and falsy assertions in executable tests.

## Rule details

`toBeTruthy()` and `toBeFalsy()` prove only JavaScript coercion behavior. They do
not show whether the returned value is the expected boolean, object, array
length, status code, or domain shape. A test can keep passing after the code
starts returning the wrong truthy object or the wrong falsy value.

## Incorrect

```ts
it("returns a user", () => {
    expect(loadUser("abc")).toBeTruthy();
});
```

```ts
it("omits deleted users", () => {
    expect(loadUser("deleted")).toBeFalsy();
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
it("omits deleted users", () => {
    expect(loadUser("deleted")).toBeNull();
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that use:

- `expect(value).toBeTruthy()`
- `expect(value).toBeFalsy()`
- negated or promise-modified forms such as `not.toBeFalsy()` and
  `resolves.toBeTruthy()`

Skipped and todo tests are left to `no-disabled-tests`.

## Options

This rule has no options.

## When not to use it

Disable this rule for compatibility tests that intentionally document JavaScript
truthiness coercion. Product and library tests should usually assert exact
booleans, nullish values, collection lengths, or object shapes.

> **Rule catalog ID:** R011
