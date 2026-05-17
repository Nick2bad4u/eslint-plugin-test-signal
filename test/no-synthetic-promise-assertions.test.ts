/**
 * @packageDocumentation
 * RuleTester coverage for no-synthetic-promise-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-synthetic-promise-assertions",
    getPluginRule("no-synthetic-promise-assertions"),
    {
        invalid: [
            {
                code: `
it("resolves", async () => {
    await expect(Promise.resolve("ok")).resolves.toBe("ok");
});
                `,
                errors: [{ messageId: "syntheticPromiseAssertion" }],
                name: "reports resolves assertions against Promise.resolve",
            },
            {
                code: `
it("rejects", async () => {
    await expect(Promise.reject(new Error("boom"))).rejects.toThrow("boom");
});
                `,
                errors: [{ messageId: "syntheticPromiseAssertion" }],
                name: "reports rejects assertions against Promise.reject",
            },
            {
                code: `
test("returns the assertion", () => {
    return expect(Promise.resolve({ id: "user-1" })).resolves.toEqual({ id: "user-1" });
});
                `,
                errors: [{ messageId: "syntheticPromiseAssertion" }],
                name: "reports returned synthetic promise assertions",
            },
            {
                code: `
it("allows bracketed promise method syntax", async () => {
    await expect(Promise["reject"](new TypeError("bad"))).rejects.toThrow(TypeError);
});
                `,
                errors: [{ messageId: "syntheticPromiseAssertion" }],
                name: "reports bracketed Promise.reject assertions",
            },
        ],
        valid: [
            {
                code: `
it("resolves with the loaded user", async () => {
    await expect(loadUser("user-1")).resolves.toEqual({ id: "user-1" });
});
                `,
                name: "allows resolves assertions against code under test",
            },
            {
                code: `
it("rejects invalid input", async () => {
    await expect(saveUser({ id: "" })).rejects.toThrow("id is required");
});
                `,
                name: "allows rejects assertions against code under test",
            },
            {
                code: `
it("uses a custom promise-like factory", async () => {
    await expect(promiseFactory.resolve("ok")).resolves.toBe("ok");
});
                `,
                name: "allows non-global promise factories",
            },
            {
                code: `
const assertSyntheticPromise = async () => {
    await expect(Promise.resolve("ok")).resolves.toBe("ok");
};
                `,
                name: "ignores helper assertions outside executable tests",
            },
            {
                code: `
it("registers a helper", () => {
    const assertSyntheticPromise = async () => {
        await expect(Promise.resolve("ok")).resolves.toBe("ok");
    };

    expect(loadUser("user-1")).toHaveProperty("id");
    void assertSyntheticPromise;
});
                `,
                name: "ignores synthetic promise assertions inside nested helper definitions",
            },
            {
                code: `
it.skip("documents a legacy synthetic assertion", async () => {
    await expect(Promise.resolve("ok")).resolves.toBe("ok");
});
                `,
                name: "ignores skipped tests",
            },
            {
                code: `
it("checks promise construction directly", () => {
    expect(Promise.resolve("ok")).toBeInstanceOf(Promise);
});
                `,
                name: "allows non-resolves and non-rejects promise assertions",
            },
        ],
    }
);
