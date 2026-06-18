# no-async-foreach-assertions

Disallow async assertion callbacks passed to `forEach` in executable tests.

## Rule details

`Array.prototype.forEach` ignores the promise returned by an async callback. In
tests, that means assertions inside the callback can run after the test has
already finished, or fail as an unhandled rejection instead of failing the test
case that scheduled them.

Use a `for...of` loop when each check should run sequentially, or use
`await Promise.all(items.map(...))` when the checks can run in parallel.

## Incorrect

```ts
it("checks every user", () => {
 users.forEach(async (user) => {
  await expect(loadProfile(user.id)).resolves.toMatchObject({
   id: user.id,
  });
 });
});
```

```ts
test("checks every token", async () => {
 tokens.forEach(async (token) => {
  const result = await validateToken(token);

  expect(result.valid).toBe(true);
 });
});
```

## Correct

```ts
it("checks every user", async () => {
 for (const user of users) {
  await expect(loadProfile(user.id)).resolves.toMatchObject({
   id: user.id,
  });
 }
});
```

```ts
it("checks every user", async () => {
 await Promise.all(
  users.map(async (user) => {
   await expect(loadProfile(user.id)).resolves.toMatchObject({
    id: user.id,
   });
  })
 );
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that contain a
`forEach(...)` call with an async callback whose directly executed body contains
an `expect(...)` assertion. It also handles computed `["forEach"]` access.

The rule does not report:

- synchronous `forEach` assertion callbacks;
- async `forEach` callbacks that do not contain assertions;
- assertions hidden inside nested helper function definitions;
- `for...of` loops or `await Promise.all(items.map(...))` patterns.

## Options

This rule has no options.

## When not to use it

This rule is normally safe for Jest- and Vitest-style test suites. Disable it
only for nonstandard test runners that deliberately capture promises returned by
`forEach` callbacks, which regular JavaScript arrays do not do.

> **Rule catalog ID:** R013
