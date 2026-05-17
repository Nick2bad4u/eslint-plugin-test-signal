/**
 * @packageDocumentation
 * RuleTester coverage for no-fixed-delay-tests.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run("no-fixed-delay-tests", getPluginRule("no-fixed-delay-tests"), {
    invalid: [
        {
            code: `
it("waits for background work", async () => {
    await sleep(100);

    expect(loadStatus()).toBe("ready");
});
            `,
            errors: [{ messageId: "fixedDelay" }],
            name: "reports awaited sleep helpers with numeric delays",
        },
        {
            code: `
test("waits for a page update", async () => {
    await page.waitForTimeout(250);

    expect(await page.textContent("main")).toBe("ready");
});
            `,
            errors: [{ messageId: "fixedDelay" }],
            name: "reports Playwright waitForTimeout calls",
        },
        {
            code: `
it("waits for a callback", async () => {
    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });

    expect(loadStatus()).toBe("ready");
});
            `,
            errors: [{ messageId: "fixedDelay" }],
            name: "reports promise-wrapped setTimeout delays",
        },
        {
            code: `
it("waits before asserting", () => {
    setTimeout(() => {
        expect(loadStatus()).toBe("ready");
    }, 50);
});
            `,
            errors: [{ messageId: "fixedDelay" }],
            name: "reports direct setTimeout delays in tests",
        },
    ],
    valid: [
        {
            code: `
it("waits for a condition", async () => {
    await waitFor(() => expect(loadStatus()).toBe("ready"));
});
            `,
            name: "allows condition-based waits",
        },
        {
            code: `
it("advances fake timers", () => {
    vi.useFakeTimers();
    scheduleRetry();
    vi.advanceTimersByTime(100);

    expect(retryCount()).toBe(1);
});
            `,
            name: "allows fake timer advancement",
        },
        {
            code: `
it("uses a configured timeout", async () => {
    await sleep(RETRY_DELAY_MS);

    expect(loadStatus()).toBe("ready");
});
            `,
            name: "allows non-literal delay values",
        },
        {
            code: `
const waitForDebounce = async () => {
    await sleep(100);
};
            `,
            name: "ignores helpers outside executable tests",
        },
        {
            code: `
it("registers a helper", () => {
    const waitForDebounce = async () => {
        await sleep(100);
    };

    expect(loadStatus()).toBe("ready");
    void waitForDebounce;
});
            `,
            name: "ignores nested helper definitions",
        },
        {
            code: `
it.skip("documents a legacy fixed wait", async () => {
    await sleep(100);
});
            `,
            name: "ignores skipped tests",
        },
    ],
});
