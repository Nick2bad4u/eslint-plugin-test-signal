# no-weak-asymmetric-assertions

Disallow vacuous whole-value asymmetric assertions.

## Rule details

Asymmetric matchers are useful inside concrete expected shapes, but they become
weak when they are the entire expected value. Assertions such as
`expect(result).toEqual(expect.anything())` or
`expect(result).toStrictEqual(expect.any(Object))` only prove broad existence or
container type. They do not verify the expected domain value, shape, length, or
state.

## Incorrect

```ts
it("returns a user", () => {
 expect(loadUser("abc")).toEqual(expect.anything());
});
```

```ts
it("returns a config object", () => {
 expect(loadConfig()).toStrictEqual(expect.any(Object));
});
```

```ts
it("returns a response subset", () => {
 expect(fetchResponse()).toMatchObject({});
});
```

## Correct

```ts
it("returns a user", () => {
 expect(loadUser("abc")).toEqual({
  id: "abc",
  name: expect.any(String),
 });
});
```

```ts
it("returns a config object", () => {
 expect(loadConfig()).toMatchObject({
  enabled: true,
 });
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that use
whole-value asymmetric assertions or empty subset assertions that prove too
little:

- `expect(value).toEqual(expect.anything())`
- `expect(value).toEqual(expect.any(Object))`
- `expect(value).toStrictEqual(expect.any(Array))`
- `expect(value).toEqual(expect.arrayContaining([]))`
- `expect(value).toEqual(expect.objectContaining({}))`
- `expect(value).toMatchObject({})`

Primitive field-level asymmetric checks such as
`expect(user).toEqual({ id: expect.any(String) })` remain valid because they sit
inside a concrete expected shape.

## Options

This rule has no options.

## When not to use it

Disable this rule for smoke tests whose whole purpose is to verify that a value
is broadly object-like. For most tests, assert at least one expected property,
length, status, or exact value.

> **Rule catalog ID:** R018
