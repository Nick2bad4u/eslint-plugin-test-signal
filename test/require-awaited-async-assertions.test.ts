/**
 * @packageDocumentation
 * RuleTester coverage for require-awaited-async-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-awaited-async-assertions",
    getPluginRule("require-awaited-async-assertions"),
    {
        invalid: [
            {
                code: `
it("rejects invalid tokens", () => {
    expect(readToken("bad")).rejects.toThrow("Invalid token");
});
                `,
                errors: [{ messageId: "unawaitedAsyncAssertion" }],
                name: "reports floating rejects assertions",
            },
            {
                code: `
it("resolves valid tokens", () => {
    expect(readToken("ok")).resolves.toEqual({ value: "ok" });
});
                `,
                errors: [{ messageId: "unawaitedAsyncAssertion" }],
                name: "reports floating resolves assertions",
            },
        ],
        valid: [
            {
                code: `
it("awaits rejected assertions", async () => {
    await expect(readToken("bad")).rejects.toThrow("Invalid token");
});
                `,
                name: "allows awaited rejects assertions",
            },
            {
                code: `
it("returns resolved assertions", () => {
    return expect(readToken("ok")).resolves.toEqual({ value: "ok" });
});
                `,
                name: "allows returned resolves assertions",
            },
        ],
    }
);
