/**
 * @packageDocumentation
 * RuleTester coverage for no-vacuous-numeric-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-vacuous-numeric-assertions",
    getPluginRule("no-vacuous-numeric-assertions"),
    {
        invalid: [
            {
                code: `
it("returns a count", () => {
    expect(loadCount()).toBeLessThan(Infinity);
});
                `,
                errors: [{ messageId: "vacuousNumericAssertion" }],
                name: "reports upper bounds using positive infinity",
            },
            {
                code: `
it("returns a count", () => {
    expect(loadCount()).toBeGreaterThan(-Infinity);
});
                `,
                errors: [{ messageId: "vacuousNumericAssertion" }],
                name: "reports lower bounds using negative infinity",
            },
            {
                code: `
it("returns a count", () => {
    expect(loadCount()).not.toBeGreaterThanOrEqual(Infinity);
});
                `,
                errors: [{ messageId: "vacuousNumericAssertion" }],
                name: "reports negated positive infinity lower bounds",
            },
            {
                code: `
it("returns a count", () => {
    expect(loadCount()).not.toBeLessThanOrEqual(-Infinity);
});
                `,
                errors: [{ messageId: "vacuousNumericAssertion" }],
                name: "reports negated negative infinity upper bounds",
            },
        ],
        valid: [
            {
                code: `
it("returns a bounded count", () => {
    expect(loadCount()).toBeLessThan(10);
});
                `,
                name: "allows finite upper bounds",
            },
            {
                code: `
it("returns a bounded count", () => {
    expect(loadCount()).toBeGreaterThanOrEqual(1);
});
                `,
                name: "allows finite lower bounds",
            },
            {
                code: `
it("uses a computed threshold", () => {
    expect(loadCount()).toBeLessThan(maximumCount);
});
                `,
                name: "allows computed thresholds",
            },
            {
                code: `
it("checks an explicit infinity contract", () => {
    expect(loadCount()).toBe(Infinity);
});
                `,
                name: "allows exact infinity assertions",
            },
            {
                code: `
const assertAnyFiniteBound = () => {
    expect(loadCount()).toBeLessThan(Infinity);
};
                `,
                name: "ignores helpers outside executable tests",
            },
            {
                code: `
it.skip("documents a legacy broad numeric assertion", () => {
    expect(loadCount()).toBeLessThan(Infinity);
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
