/**
 * @packageDocumentation
 * RuleTester coverage for no-weak-existence-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-weak-existence-assertions",
    getPluginRule("no-weak-existence-assertions"),
    {
        invalid: [
            {
                code: `
it("returns a user", () => {
    expect(loadUser("abc")).toBeDefined();
});
                `,
                errors: [{ messageId: "weakExistenceAssertion" }],
                name: "reports toBeDefined assertions",
            },
            {
                code: `
test("returns a user", () => {
    expect(loadUser("abc")).not.toBeNull();
});
                `,
                errors: [{ messageId: "weakExistenceAssertion" }],
                name: "reports negated toBeNull assertions",
            },
            {
                code: `
it("loads a user asynchronously", async () => {
    await expect(loadUser("abc")).resolves.not.toBeUndefined();
});
                `,
                errors: [{ messageId: "weakExistenceAssertion" }],
                name: "reports promise-modified negated undefined assertions",
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
                name: "allows exact object assertions",
            },
            {
                code: `
it("omits missing users", () => {
    expect(loadUser("missing")).toBeUndefined();
});
                `,
                name: "allows explicit absence assertions",
            },
            {
                code: `
it("omits missing users", () => {
    expect(loadUser("missing")).not.toBeDefined();
});
                `,
                name: "allows negated defined assertions",
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
    expect(value).toBeDefined();
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it("registers a helper", () => {
    const assertLoaded = (value: unknown) => {
        expect(value).toBeDefined();
    };

    expect(loadUser("abc")).toMatchObject({ id: "abc" });
    void assertLoaded;
});
                `,
                name: "ignores assertions inside nested helper definitions",
            },
            {
                code: `
it.skip("documents a smoke check", () => {
    expect(loadUser("legacy")).toBeDefined();
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
