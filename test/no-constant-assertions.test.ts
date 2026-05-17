/**
 * @packageDocumentation
 * RuleTester coverage for no-constant-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-constant-assertions",
    getPluginRule("no-constant-assertions"),
    {
        invalid: [
            {
                code: `
it("passes without exercising code", () => {
    expect(true).toBe(true);
});
                `,
                errors: [{ messageId: "constantAssertion" }],
                name: "reports exact literal assertions",
            },
            {
                code: `
test("checks only a static object", () => {
    expect({ enabled: true, id: "abc" }).toEqual({
        enabled: true,
        id: "abc",
    });
});
                `,
                errors: [{ messageId: "constantAssertion" }],
                name: "reports static object assertions",
            },
            {
                code: `
it("checks only a static array", () => {
    expect(["admin", "editor"]).toContain("admin");
});
                `,
                errors: [{ messageId: "constantAssertion" }],
                name: "reports static array assertions",
            },
            {
                code: `
it("checks only a nullish literal", () => {
    expect(undefined).toBeUndefined();
});
                `,
                errors: [{ messageId: "constantAssertion" }],
                name: "reports static undefined assertions",
            },
            {
                code: `
it("checks only a typed literal", () => {
    expect("ready" as const).toMatch(/^ready$/u);
});
                `,
                errors: [{ messageId: "constantAssertion" }],
                name: "reports type-asserted static literals",
            },
        ],
        valid: [
            {
                code: `
it("checks a returned object", () => {
    expect(loadUser("abc")).toEqual({
        enabled: true,
        id: "abc",
    });
});
                `,
                name: "allows values produced by code under test",
            },
            {
                code: `
it("checks a derived property", () => {
    const user = loadUser("abc");

    expect(user.enabled).toBe(true);
});
                `,
                name: "allows member expressions",
            },
            {
                code: `
it("checks a helper result", () => {
    expect(createRoles()).toContain("admin");
});
                `,
                name: "allows call expression subjects",
            },
            {
                code: `
const assertMatcherBehavior = () => {
    expect(true).toBe(true);
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it("registers a helper", () => {
    const assertMatcherBehavior = () => {
        expect(true).toBe(true);
    };

    expect(loadUser("abc").enabled).toBe(true);
    void assertMatcherBehavior;
});
                `,
                name: "ignores assertions inside nested helper definitions",
            },
            {
                code: `
it.skip("documents matcher behavior", () => {
    expect(true).toBe(true);
});
                `,
                name: "ignores skipped tests",
            },
            {
                code: `
it("uses a weak truthy assertion covered by another rule", () => {
    expect(true).toBeTruthy();
});
                `,
                name: "leaves truthy constants to no-weak-truthy-assertions",
            },
        ],
    }
);
