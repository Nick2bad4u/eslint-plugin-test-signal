# no-snapshot-only-tests

Disallow tests whose entire assertion surface is snapshot matching.

## Rule details

Snapshots are useful regression aids, but a snapshot-only test often says little
about the behavior that matters. The reader must inspect a generated artifact to
understand the expected outcome, and broad snapshots can be updated without
reviewing the semantic guarantee.

## Incorrect

```ts
it("renders the error panel", () => {
 expect(renderErrorPanel({ code: "E_AUTH" })).toMatchSnapshot();
});
```

## Correct

```ts
it("renders the error panel", () => {
 const panel = renderErrorPanel({ code: "E_AUTH" });

 expect(panel.role).toBe("alert");
 expect(panel).toMatchSnapshot();
});
```

## What this rule reports

This rule reports executable tests where every `expect(...)` assertion uses a
snapshot matcher such as `toMatchSnapshot()` or `toMatchInlineSnapshot()`.

## Options

This rule has no options.

## When not to use it

Disable this rule for intentionally visual snapshot suites that are reviewed
through a separate snapshot approval workflow.

> **Rule catalog ID:** R003
