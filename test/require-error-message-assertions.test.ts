/**
 * @packageDocumentation
 * RuleTester coverage for require-error-message-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-error-message-assertions",
    getPluginRule("require-error-message-assertions"),
    {
        invalid: [
            {
                code: `
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrow();
});
                `,
                errors: [{ messageId: "missingErrorExpectation" }],
                name: "reports bare toThrow assertions",
            },
            {
                code: `
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrowError();
});
                `,
                errors: [{ messageId: "missingErrorExpectation" }],
                name: "reports bare toThrowError assertions",
            },
            {
                code: `
it("rejects missing users", async () => {
    await expect(loadUser("missing")).rejects.toThrow();
});
                `,
                errors: [{ messageId: "missingErrorExpectation" }],
                name: "reports bare async rejection throw assertions",
            },
        ],
        valid: [
            {
                code: `
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrow("Token is required");
});
                `,
                name: "allows expected error messages",
            },
            {
                code: `
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrow(/required/u);
});
                `,
                name: "allows expected error patterns",
            },
            {
                code: `
it("rejects invalid tokens", () => {
    expect(() => parseToken("")).toThrow(SyntaxError);
});
                `,
                name: "allows expected error constructors",
            },
            {
                code: `
it("accepts valid tokens", () => {
    expect(() => parseToken("abc")).not.toThrow();
});
                `,
                name: "allows no-throw assertions",
            },
            {
                code: `
it("rejects missing users", async () => {
    await expect(loadUser("missing")).rejects.toThrow("Missing user");
});
                `,
                name: "allows rejection assertions with expected messages",
            },
            {
                code: `
const assertThrows = (callback: () => void) => {
    expect(callback).toThrow();
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it.skip("documents legacy error coverage", () => {
    expect(() => parseToken("")).toThrow();
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
