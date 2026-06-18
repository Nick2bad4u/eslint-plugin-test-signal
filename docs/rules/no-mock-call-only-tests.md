# no-mock-call-only-tests

Disallow tests whose only assertions inspect mock calls or return counts.

## Rule details

Mock call assertions prove that an implementation detail was invoked. They do
not necessarily prove that the caller observed the correct result. This rule
pushes tests toward at least one externally visible outcome assertion.

## Incorrect

```ts
it("sends a welcome email", () => {
 const sendEmail = vi.fn();

 registerUser({ email: "user@example.com", sendEmail });

 expect(sendEmail).toHaveBeenCalledTimes(1);
});
```

## Correct

```ts
it("sends a welcome email", () => {
 const sendEmail = vi.fn();

 const result = registerUser({ email: "user@example.com", sendEmail });

 expect(result.status).toBe("created");
 expect(sendEmail).toHaveBeenCalledTimes(1);
});
```

## What this rule reports

This rule reports executable tests where every assertion is a mock-call matcher
such as `toHaveBeenCalled()`, `toHaveBeenCalledWith()`, or
`toHaveBeenCalledTimes()`.

## Options

This rule has no options.

## When not to use it

Disable this rule for focused adapter tests where the only public contract is a
call into a mocked boundary.

> **Rule catalog ID:** R004
