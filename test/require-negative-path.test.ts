/**
 * @packageDocumentation
 * RuleTester coverage for require-negative-path.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-negative-path",
    getPluginRule("require-negative-path"),
    {
        invalid: [
            {
                code: `
describe("parseToken", () => {
    it("parses valid tokens", () => {
        expect(parseToken("abc")).toEqual({ value: "abc" });
    });
});
                `,
                errors: [{ messageId: "missingNegativePath" }],
                name: "reports suites without negative-path coverage",
            },
            {
                code: `
it("parses valid tokens", () => {
    expect(parseToken("abc")).toEqual({ value: "abc" });
});
                `,
                errors: [{ messageId: "missingNegativePath" }],
                name: "reports top-level tests without negative-path coverage",
            },
        ],
        valid: [
            {
                code: `
describe("parseToken", () => {
    it("parses valid tokens", () => {
        expect(parseToken("abc")).toEqual({ value: "abc" });
    });

    it("throws for invalid tokens", () => {
        expect(() => parseToken("")).toThrow("Invalid token");
    });
});
                `,
                name: "allows suites with throw assertions",
            },
            {
                code: `
describe("loadUser", () => {
    it("rejects missing users", async () => {
        await expect(loadUser("missing")).rejects.toThrow("Missing user");
    });
});
                `,
                name: "allows suites with rejects assertions",
            },
        ],
    }
);
