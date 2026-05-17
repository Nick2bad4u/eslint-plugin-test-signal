/**
 * @packageDocumentation
 * RuleTester coverage for no-tautological-length-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-tautological-length-assertions",
    getPluginRule("no-tautological-length-assertions"),
    {
        invalid: [
            {
                code: `
it("returns items", () => {
    expect(loadItems().length).toBeGreaterThanOrEqual(0);
});
                `,
                errors: [{ messageId: "tautologicalLengthAssertion" }],
                name: "reports non-negative length lower bound assertions",
            },
            {
                code: `
test("returns items", () => {
    expect(loadItems().length).toBeGreaterThan(-1);
});
                `,
                errors: [{ messageId: "tautologicalLengthAssertion" }],
                name: "reports greater-than negative one length assertions",
            },
            {
                code: `
it("returns items", () => {
    expect(loadItems().length).not.toBeLessThan(0);
});
                `,
                errors: [{ messageId: "tautologicalLengthAssertion" }],
                name: "reports negated less-than zero assertions",
            },
            {
                code: `
it("returns items", () => {
    expect(loadItems().length).not.toBeLessThanOrEqual(-1);
});
                `,
                errors: [{ messageId: "tautologicalLengthAssertion" }],
                name: "reports negated less-than-or-equal negative one assertions",
            },
        ],
        valid: [
            {
                code: `
it("returns two items", () => {
    expect(loadItems().length).toBe(2);
});
                `,
                name: "allows exact length assertions",
            },
            {
                code: `
it("returns at least one item", () => {
    expect(loadItems().length).toBeGreaterThan(0);
});
                `,
                name: "allows positive lower-bound assertions",
            },
            {
                code: `
it("returns fewer than ten items", () => {
    expect(loadItems().length).toBeLessThan(10);
});
                `,
                name: "allows meaningful upper-bound assertions",
            },
            {
                code: `
it("uses a computed lower bound", () => {
    expect(loadItems().length).toBeGreaterThanOrEqual(minimumItemCount);
});
                `,
                name: "allows computed lower bounds",
            },
            {
                code: `
const assertAnyLength = (items: readonly unknown[]) => {
    expect(items.length).toBeGreaterThanOrEqual(0);
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it("registers a helper", () => {
    const assertAnyLength = (items: readonly unknown[]) => {
        expect(items.length).toBeGreaterThanOrEqual(0);
    };

    expect(loadItems()).toHaveLength(2);
    void assertAnyLength;
});
                `,
                name: "ignores assertions inside nested helper definitions",
            },
            {
                code: `
it.skip("documents a legacy weak length check", () => {
    expect(loadItems().length).toBeGreaterThanOrEqual(0);
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
