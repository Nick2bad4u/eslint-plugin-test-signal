/**
 * @packageDocumentation
 * RuleTester coverage for no-vacuous-string-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-vacuous-string-assertions",
    getPluginRule("no-vacuous-string-assertions"),
    {
        invalid: [
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toContain("");
});
                `,
                errors: [{ messageId: "vacuousStringAssertion" }],
                name: "reports empty toContain expectations",
            },
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toMatch(/.*/);
});
                `,
                errors: [{ messageId: "vacuousStringAssertion" }],
                name: "reports match-all regular expressions",
            },
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toMatch(/^.*$/);
});
                `,
                errors: [{ messageId: "vacuousStringAssertion" }],
                name: "reports anchored match-all regular expressions",
            },
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toEqual(expect.stringContaining(""));
});
                `,
                errors: [{ messageId: "vacuousStringAssertion" }],
                name: "reports empty stringContaining asymmetric matchers",
            },
        ],
        valid: [
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toContain("Saved");
});
                `,
                name: "allows concrete contained text",
            },
            {
                code: String.raw`
it("renders content", () => {
    expect(renderedText()).toMatch(/^Saved \\d+ items$/);
});
                `,
                name: "allows specific regular expressions",
            },
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toEqual(expect.stringContaining("Saved"));
});
                `,
                name: "allows non-empty stringContaining matchers",
            },
            {
                code: `
it("renders content", () => {
    expect(renderedText()).toContain(expectedText);
});
                `,
                name: "allows computed expected text",
            },
            {
                code: `
const assertAnyText = () => {
    expect(renderedText()).toContain("");
};
                `,
                name: "ignores helpers outside executable tests",
            },
            {
                code: `
it.skip("documents a legacy broad text assertion", () => {
    expect(renderedText()).toContain("");
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
