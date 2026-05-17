/**
 * @packageDocumentation
 * RuleTester coverage for no-mock-call-only-tests.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-mock-call-only-tests",
    getPluginRule("no-mock-call-only-tests"),
    {
        invalid: [
            {
                code: `
it("sends the message", () => {
    const send = vi.fn();

    saveUser({ send });

    expect(send).toHaveBeenCalledTimes(1);
});
                `,
                errors: [{ messageId: "mockCallOnlyTest" }],
                name: "reports mock-call-only tests",
            },
        ],
        valid: [
            {
                code: `
it("sends the message", () => {
    const send = vi.fn();

    const result = saveUser({ send });

    expect(result.status).toBe("saved");
    expect(send).toHaveBeenCalledTimes(1);
});
                `,
                name: "allows mock assertions with behavior assertions",
            },
            {
                code: `
it("checks output only", () => {
    expect(saveUser()).toEqual({ status: "saved" });
});
                `,
                name: "allows output-only assertions",
            },
        ],
    }
);
