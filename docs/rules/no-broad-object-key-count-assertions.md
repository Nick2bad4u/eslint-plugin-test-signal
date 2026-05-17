# no-broad-object-key-count-assertions

Disallow object key-count assertions that only prove an object is non-empty.

## Rule details

`Object.keys(value).length > 0` proves only that an object has at least one own
enumerable key. It does not prove that the object has the expected shape,
required keys, or expected values. These assertions are especially weak for API
payloads and config objects where a regression can keep returning the wrong
keys while still being non-empty.

## Incorrect

```ts
it("returns config", () => {
    expect(Object.keys(loadConfig()).length).toBeGreaterThan(0);
});
```

```ts
it("returns config", () => {
    expect(Object.keys(loadConfig()).length).not.toBe(0);
});
```

## Correct

```ts
it("returns config", () => {
    expect(loadConfig()).toMatchObject({ mode: "production" });
});
```

```ts
it("returns config keys", () => {
    expect(Object.keys(loadConfig())).toEqual(["mode", "region"]);
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks with broad
non-empty key-count checks against `Object.keys(...).length`:

- `toBeGreaterThan(0)`
- `toBeGreaterThanOrEqual(1)`
- `not.toBe(0)`
- `not.toHaveLength(0)`

The rule intentionally does not flag exact key counts or computed thresholds.

## Options

This rule has no options.

## When not to use it

Disable this rule for tests whose real contract is only that an object is
non-empty. Most product tests should assert the expected keys, shape, or values.

> **Rule catalog ID:** R024
