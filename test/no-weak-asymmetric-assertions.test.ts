/**
 * @packageDocumentation
 * RuleTester coverage for no-weak-asymmetric-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-weak-asymmetric-assertions",
    getPluginRule("no-weak-asymmetric-assertions"),
    {
        invalid: [
            {
                code: `
it("returns a user", () => {
    expect(loadUser("abc")).toEqual(expect.anything());
});
                `,
                errors: [{ messageId: "weakAsymmetricAssertion" }],
                name: "reports whole-value expect.anything assertions",
            },
            {
                code: `
test("returns some object", () => {
    expect(loadConfig()).toStrictEqual(expect.any(Object));
});
                `,
                errors: [{ messageId: "weakAsymmetricAssertion" }],
                name: "reports broad object constructor asymmetric assertions",
            },
            {
                code: `
it("returns some array", () => {
    expect(loadItems()).toEqual(expect.arrayContaining([]));
});
                `,
                errors: [{ messageId: "weakAsymmetricAssertion" }],
                name: "reports empty arrayContaining whole-value assertions",
            },
            {
                code: `
it("returns some object", () => {
    expect(loadConfig()).toEqual(expect.objectContaining({}));
});
                `,
                errors: [{ messageId: "weakAsymmetricAssertion" }],
                name: "reports empty objectContaining whole-value assertions",
            },
            {
                code: `
it("matches a response subset", () => {
    expect(fetchResponse()).toMatchObject({});
});
                `,
                errors: [{ messageId: "weakEmptySubsetAssertion" }],
                name: "reports empty toMatchObject subset assertions",
            },
        ],
        valid: [
            {
                code: `
it("returns a user", () => {
    expect(loadUser("abc")).toEqual({
        id: "abc",
        name: expect.any(String),
    });
});
                `,
                name: "allows field-level asymmetric type checks inside concrete shapes",
            },
            {
                code: `
it("returns a generated id", () => {
    expect(loadUser("abc").id).toEqual(expect.any(String));
});
                `,
                name: "allows specific primitive type checks",
            },
            {
                code: `
it("returns active users", () => {
    expect(loadActiveUsers()).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: "abc" }),
    ]));
});
                `,
                name: "allows non-empty arrayContaining assertions",
            },
            {
                code: `
it("returns a config subset", () => {
    expect(loadConfig()).toMatchObject({
        enabled: true,
    });
});
                `,
                name: "allows non-empty subset assertions",
            },
            {
                code: `
const assertAnything = (value: unknown) => {
    expect(value).toEqual(expect.anything());
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it("registers a helper", () => {
    const assertAnything = (value: unknown) => {
        expect(value).toEqual(expect.anything());
    };

    expect(loadUser("abc")).toMatchObject({ id: "abc" });
    void assertAnything;
});
                `,
                name: "ignores assertions inside nested helper definitions",
            },
            {
                code: `
it.skip("documents a legacy weak assertion", () => {
    expect(loadUser("legacy")).toEqual(expect.anything());
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
