/**
 * @packageDocumentation
 * RuleTester coverage for no-duplicate-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run("no-duplicate-assertions", getPluginRule("no-duplicate-assertions"), {
    invalid: [
        {
            code: `
it("returns user metadata", () => {
    const user = loadUser();

    expect(user.id).toBe("user-1");
    expect(user.id).toBe("user-1");
});
            `,
            errors: [{ messageId: "duplicateAssertion" }],
            name: "reports identical repeated assertions",
        },
        {
            code: `
it("returns user metadata", () => {
    const user = loadUser();

    expect(user).toMatchObject({ id: "user-1" });
    expect(user).toMatchObject({ id: "user-1" });
});
            `,
            errors: [{ messageId: "duplicateAssertion" }],
            name: "reports duplicate assertions with different whitespace",
        },
    ],
    valid: [
        {
            code: `
it("returns user metadata", () => {
    const user = loadUser();

    expect(user.id).toBe("user-1");
    expect(user.name).toBe("Ada");
});
            `,
            name: "allows distinct assertions",
        },
        {
            code: `
it("checks before and after state with distinct expected values", () => {
    expect(store.getState()).toBe("idle");
    store.load();
    expect(store.getState()).toBe("loaded");
});
            `,
            name: "allows repeated subjects with different expected values",
        },
        {
            code: `
const assertUser = (user: { id: string }) => {
    expect(user.id).toBe("user-1");
    expect(user.id).toBe("user-1");
};
            `,
            name: "ignores helpers outside executable tests",
        },
        {
            code: `
it("registers a helper", () => {
    const assertUser = (user: { id: string }) => {
        expect(user.id).toBe("user-1");
        expect(user.id).toBe("user-1");
    };

    expect(loadUser().id).toBe("user-1");
    void assertUser;
});
            `,
            name: "ignores nested helper definitions",
        },
        {
            code: `
it.skip("documents a legacy duplicate assertion", () => {
    expect(loadUser().id).toBe("user-1");
    expect(loadUser().id).toBe("user-1");
});
            `,
            name: "ignores skipped tests",
        },
    ],
});
