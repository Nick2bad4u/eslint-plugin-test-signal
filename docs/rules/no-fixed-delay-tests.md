# no-fixed-delay-tests

Disallow fixed real-time delays in executable tests.

## Rule details

Fixed waits make tests slow and flaky. They pass or fail based on timing instead
of an observable condition. Prefer waiting for a DOM/API state, awaiting the real
operation under test, or using fake timers for debounce, retry, and backoff
logic.

## Incorrect

```ts
it("waits for background work", async () => {
    await sleep(100);

    expect(loadStatus()).toBe("ready");
});
```

```ts
it("waits for a callback", async () => {
    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });

    expect(loadStatus()).toBe("ready");
});
```

## Correct

```ts
it("waits for background work", async () => {
    await waitFor(() => expect(loadStatus()).toBe("ready"));
});
```

```ts
it("advances fake timers", () => {
    vi.useFakeTimers();
    scheduleRetry();
    vi.advanceTimersByTime(100);

    expect(retryCount()).toBe(1);
});
```

## What this rule reports

This rule reports executable `it(...)` and `test(...)` callbacks that use
literal real-time delays:

- `await sleep(100)`
- `await delay(100)`
- `await timeout(100)`
- `await wait(100)`
- `await page.waitForTimeout(100)`
- `setTimeout(callback, 100)`
- `new Promise((resolve) => setTimeout(resolve, 100))`

Non-literal delays are left alone because named constants often represent
product timing contracts. Fake timer APIs are also allowed.

## Options

This rule has no options.

## When not to use it

This rule is part of the strict preset because some low-level timer tests may
intentionally exercise real elapsed time. Prefer a local disable with a short
reason for those tests.

> **Rule catalog ID:** R020
