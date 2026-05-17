/**
 * @packageDocumentation
 * RuleTester coverage for require-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run("require-assertions", getPluginRule("require-assertions"), {
    invalid: [
        {
            code: `
it("calls the subject", () => {
    renderWidget({ mode: "compact" });
});
            `,
            errors: [{ messageId: "missingAssertion" }],
            name: "reports executable tests without assertions",
        },
    ],
    valid: [
        {
            code: `
it("renders compact mode", () => {
    expect(renderWidget({ mode: "compact" }).mode).toBe("compact");
});
            `,
            name: "allows tests with assertions",
        },
        {
            code: `
it.skip("tracks a known gap", () => {
    renderWidget({ mode: "compact" });
});
            `,
            name: "leaves disabled test policy to no-disabled-tests",
        },
    ],
});
