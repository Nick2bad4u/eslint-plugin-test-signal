/**
 * @packageDocumentation
 * RuleTester coverage for no-empty-async-tests.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run("no-empty-async-tests", getPluginRule("no-empty-async-tests"), {
    invalid: [
        {
            code: `
it("loads data", async () => {
    await loadData();
});
            `,
            errors: [{ messageId: "emptyAsyncTest" }],
            name: "reports async tests without assertions",
        },
    ],
    valid: [
        {
            code: `
it("loads data", async () => {
    await expect(loadData()).resolves.toEqual({ ok: true });
});
            `,
            name: "allows async tests with awaited assertions",
        },
        {
            code: `
it("uses synchronous assertions", () => {
    expect(loadSync()).toBe("ok");
});
            `,
            name: "ignores synchronous tests",
        },
    ],
});
