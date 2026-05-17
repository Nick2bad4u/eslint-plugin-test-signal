/**
 * @packageDocumentation
 * RuleTester coverage for no-identical-expected-actual.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-identical-expected-actual",
    getPluginRule("no-identical-expected-actual"),
    {
        invalid: [
            {
                code: `
it("returns the saved user", () => {
    const user = saveUser({ id: "abc" });

    expect(user).toEqual(user);
});
                `,
                errors: [{ messageId: "identicalExpectedActual" }],
                name: "reports identical toEqual subject and expected value",
            },
            {
                code: `
test("returns the current state", () => {
    expect(store.state.current).toStrictEqual(store.state.current);
});
                `,
                errors: [{ messageId: "identicalExpectedActual" }],
                name: "reports identical member expressions",
            },
            {
                code: `
it("returns a typed value", () => {
    const value = loadValue();

    expect(value as string).toBe(value);
});
                `,
                errors: [{ messageId: "identicalExpectedActual" }],
                name: "unwraps TypeScript assertion wrappers",
            },
            {
                code: `
it("matches an object shape", () => {
    expect(response.body).toMatchObject(response.body);
});
                `,
                errors: [{ messageId: "identicalExpectedActual" }],
                name: "reports identical toMatchObject comparisons",
            },
        ],
        valid: [
            {
                code: `
it("returns the saved user", () => {
    expect(saveUser({ id: "abc" })).toEqual({
        id: "abc",
    });
});
                `,
                name: "allows independent expected object values",
            },
            {
                code: `
it("returns the current state", () => {
    const expectedState = createExpectedState();

    expect(store.state.current).toStrictEqual(expectedState);
});
                `,
                name: "allows separately computed expected values",
            },
            {
                code: `
it("returns a stable reference", () => {
    const expectedUser = user;

    expect(loadCachedUser()).toBe(expectedUser);
});
                `,
                name: "allows aliases because the source expressions differ",
            },
            {
                code: `
const assertStable = (value: unknown) => {
    expect(value).toEqual(value);
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it("registers a helper", () => {
    const assertStable = (value: unknown) => {
        expect(value).toEqual(value);
    };

    expect(loadUser("abc")).toEqual({ id: "abc" });
    void assertStable;
});
                `,
                name: "ignores assertions inside nested helper definitions",
            },
            {
                code: `
it.skip("documents a legacy tautology", () => {
    expect(user).toEqual(user);
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
