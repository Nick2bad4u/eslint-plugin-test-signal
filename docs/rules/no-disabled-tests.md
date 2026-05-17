# no-disabled-tests

Disallow skipped, todo, and disabled tests.

## Rule details

Disabled tests preserve the shape of missing coverage without enforcing it.
That creates false confidence: the test file appears to describe a scenario,
but the scenario does not actually run.

## Incorrect

```ts
it.skip("rejects expired tokens", () => {
    expect(() => verifyToken(expiredToken)).toThrow("expired");
});
```

## Correct

```ts
it("rejects expired tokens", () => {
    expect(() => verifyToken(expiredToken)).toThrow("expired");
});
```

## What this rule reports

This rule reports disabled Jest/Vitest-style test and suite declarations such as
`it.skip(...)`, `test.todo(...)`, `describe.skip(...)`, `xit(...)`, `xtest(...)`,
and `xdescribe(...)`.

## Options

This rule has no options.

## When not to use it

Disable this rule only in repositories that intentionally keep executable test
backlog items as `todo` tests and track that backlog separately.

> **Rule catalog ID:** R007
