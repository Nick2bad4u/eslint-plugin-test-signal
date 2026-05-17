/**
 * @packageDocumentation
 * RuleTester coverage for no-focused-tests.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run("no-focused-tests", getPluginRule("no-focused-tests"), {
    invalid: [
        {
            code: `
it.only("runs one case", () => {
    expect(result).toBe("ok");
});
            `,
            errors: [{ messageId: "focusedTest" }],
            name: "reports focused test modifiers",
        },
        {
            code: `
fdescribe("focused suite", () => {
    it("runs a case", () => {
        expect(result).toBe("ok");
    });
});
            `,
            errors: [{ messageId: "focusedTest" }],
            name: "reports focused suite aliases",
        },
    ],
    valid: [
        {
            code: `
describe("complete suite", () => {
    it("runs a case", () => {
        expect(result).toBe("ok");
    });
});
            `,
            name: "allows normal tests and suites",
        },
    ],
});
