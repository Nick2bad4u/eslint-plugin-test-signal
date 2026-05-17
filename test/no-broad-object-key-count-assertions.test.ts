/**
 * @packageDocumentation
 * RuleTester coverage for no-broad-object-key-count-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-broad-object-key-count-assertions",
    getPluginRule("no-broad-object-key-count-assertions"),
    {
        invalid: [
            {
                code: `
it("returns config", () => {
    expect(Object.keys(loadConfig()).length).toBeGreaterThan(0);
});
                `,
                errors: [{ messageId: "broadObjectKeyCountAssertion" }],
                name: "reports greater-than zero object key count assertions",
            },
            {
                code: `
it("returns config", () => {
    expect(Object.keys(loadConfig()).length).toBeGreaterThanOrEqual(1);
});
                `,
                errors: [{ messageId: "broadObjectKeyCountAssertion" }],
                name: "reports greater-than-or-equal one object key count assertions",
            },
            {
                code: `
it("returns config", () => {
    expect(Object.keys(loadConfig()).length).not.toBe(0);
});
                `,
                errors: [{ messageId: "broadObjectKeyCountAssertion" }],
                name: "reports negated zero object key count assertions",
            },
            {
                code: `
it("returns config", () => {
    expect(Object.keys(loadConfig()).length).not.toHaveLength(0);
});
                `,
                errors: [{ messageId: "broadObjectKeyCountAssertion" }],
                name: "reports negated zero object key length assertions",
            },
        ],
        valid: [
            {
                code: `
it("returns config", () => {
    expect(loadConfig()).toMatchObject({ mode: "production" });
});
                `,
                name: "allows concrete object shape assertions",
            },
            {
                code: `
it("returns config keys", () => {
    expect(Object.keys(loadConfig())).toEqual(["mode", "region"]);
});
                `,
                name: "allows exact object key assertions",
            },
            {
                code: `
it("returns two config keys", () => {
    expect(Object.keys(loadConfig()).length).toBe(2);
});
                `,
                name: "allows exact key count assertions",
            },
            {
                code: `
it("uses a computed minimum", () => {
    expect(Object.keys(loadConfig()).length).toBeGreaterThan(minimumKeyCount);
});
                `,
                name: "allows computed key count thresholds",
            },
            {
                code: `
const assertAnyConfig = () => {
    expect(Object.keys(loadConfig()).length).toBeGreaterThan(0);
};
                `,
                name: "ignores helpers outside executable tests",
            },
            {
                code: `
it.skip("documents a legacy broad object assertion", () => {
    expect(Object.keys(loadConfig()).length).toBeGreaterThan(0);
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
