# no-constant-assertions

Disallow assertions whose subject is a static constant.

## Rule details

Assertions should prove behavior from the code under test. An assertion that
starts from a literal, static object, static array, or other constant expression
can pass without executing any product code. These checks often come from
temporary matcher experiments, copy/paste mistakes, or tests that were scaffolded
but never connected to the real subject.

## Incorrect

```ts
it("passes without exercising code", () => {
    expect(true).toBe(true);
});
```

```ts
it("checks only a static fixture", () => {
    expect({ enabled: true, id: "abc" }).toEqual({
        enabled: true,
        id: "abc",
    });
});
```

## Correct

```ts
it("returns an enabled user", () => {
    expect(loadUser("abc")).toEqual({
        enabled: true,
        id: "abc",
    });
});
```

```ts
it("returns an admin role", () => {
    expect(createRoles()).toContain("admin");
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks when an
`expect(...)` assertion receives a static subject such as:

- a literal: `expect(true).toBe(true)`
- a no-substitution template: ``expect(`ready`).toBe("ready")``
- a static object or array: `expect({ ok: true }).toEqual({ ok: true })`
- a wrapped static value: `expect("ready" as const).toMatch(/^ready$/u)`

`toBeTruthy()` and `toBeFalsy()` are left to
`no-weak-truthy-assertions`, so projects do not receive duplicate reports for
the same assertion.

## Options

This rule has no options.

## When not to use it

Disable this rule for tests that intentionally document matcher behavior,
JavaScript runtime constants, or compatibility quirks. Product and library tests
should assert values produced by the code under test.

> **Rule catalog ID:** R015
