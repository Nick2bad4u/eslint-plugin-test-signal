/**
 * @packageDocumentation
 * RuleTester coverage for no-disabled-tests.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run("no-disabled-tests", getPluginRule("no-disabled-tests"), {
    invalid: [
        {
            code: `
it.skip("documents a missing behavior", () => {
    expect(result).toBe("ok");
});
            `,
            errors: [{ messageId: "disabledTest" }],
            name: "reports skipped tests",
        },
        {
            code: `
test.todo("covers the timeout branch");
            `,
            errors: [{ messageId: "disabledTest" }],
            name: "reports todo tests",
        },
        {
            code: `
xdescribe("disabled suite", () => {
    it("runs a case", () => {
        expect(result).toBe("ok");
    });
});
            `,
            errors: [{ messageId: "disabledTest" }],
            name: "reports disabled suite aliases",
        },
    ],
    valid: [
        {
            code: `
it("covers the behavior", () => {
    expect(result).toBe("ok");
});
            `,
            name: "allows executable tests",
        },
    ],
});
