/**
 * @packageDocumentation
 * RuleTester coverage for no-weak-truthy-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-weak-truthy-assertions",
    getPluginRule("no-weak-truthy-assertions"),
    {
        invalid: [
            {
                code: `
it("returns a user", () => {
    expect(loadUser("abc")).toBeTruthy();
});
                `,
                errors: [{ messageId: "weakTruthyAssertion" }],
                name: "reports toBeTruthy assertions",
            },
            {
                code: `
test("omits deleted users", () => {
    expect(loadUser("deleted")).toBeFalsy();
});
                `,
                errors: [{ messageId: "weakTruthyAssertion" }],
                name: "reports toBeFalsy assertions",
            },
            {
                code: `
it("rejects stale users", async () => {
    await expect(loadUser("stale")).resolves.toBeFalsy();
});
                `,
                errors: [{ messageId: "weakTruthyAssertion" }],
                name: "reports weak matchers through promise modifiers",
            },
            {
                code: `
it("returns an enabled user", () => {
    expect(loadUser("abc")).not.toBeFalsy();
});
                `,
                errors: [{ messageId: "weakTruthyAssertion" }],
                name: "reports negated weak matchers",
            },
        ],
        valid: [
            {
                code: `
it("returns a user", () => {
    expect(loadUser("abc")).toEqual({
        enabled: true,
        id: "abc",
    });
});
                `,
                name: "allows object shape assertions",
            },
            {
                code: `
it("marks active users", () => {
    expect(loadUser("abc").active).toBe(true);
});
                `,
                name: "allows exact boolean assertions",
            },
            {
                code: `
it("returns active users", () => {
    expect(loadActiveUsers()).toHaveLength(2);
});
                `,
                name: "allows length assertions",
            },
            {
                code: `
const assertLoaded = (value: unknown) => {
    expect(value).toBeTruthy();
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it.skip("documents a legacy truthiness check", () => {
    expect(loadUser("legacy")).toBeTruthy();
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
