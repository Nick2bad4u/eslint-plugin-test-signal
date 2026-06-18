# no-assertions-in-hooks

Disallow assertions hidden inside test lifecycle hooks.

## Rule details

Assertions in `beforeEach`, `beforeAll`, `afterEach`, or `afterAll` hide the
behavior being verified outside the visible test case. That makes failures
harder to connect to a scenario and can make a suite look well asserted even
when individual tests only perform setup.

Lifecycle hooks should prepare or clean up state. Put assertions in explicit
`it(...)` or `test(...)` cases with titles that explain the behavior being
proved.

## Incorrect

```ts
beforeEach(() => {
 expect(console.error).not.toHaveBeenCalled();
});

it("renders the widget", () => {
 renderWidget();
});
```

```ts
afterEach(async () => {
 await expect(closeServer()).resolves.toBeUndefined();
});
```

## Correct

```ts
beforeEach(() => {
 vi.clearAllMocks();
});

it("renders the widget without console errors", () => {
 renderWidget();

 expect(console.error).not.toHaveBeenCalled();
});
```

```ts
it("closes the server cleanly", async () => {
 await expect(closeServer()).resolves.toBeUndefined();
});
```

## What this rule reports

This rule reports direct `expect(...)` and `expect.*(...)` calls in Jest- and
Vitest-style lifecycle hook callbacks:

- `beforeEach`
- `beforeAll`
- `afterEach`
- `afterAll`

Assertions inside nested helper function definitions are ignored because they do
not run when the hook itself executes.

## Options

This rule has no options.

## When not to use it

Some teams intentionally keep suite-wide invariant checks in teardown hooks, for
example verifying that a logger was not called in every test. Keep this rule in
`strict` if that pattern is common and migrate high-value invariants into named
tests when failures need clearer ownership.

> **Rule catalog ID:** R014
