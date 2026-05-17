/**
 * @packageDocumentation
 * RuleTester coverage for no-async-foreach-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-async-foreach-assertions",
    getPluginRule("no-async-foreach-assertions"),
    {
        invalid: [
            {
                code: `
it("checks every user", () => {
    users.forEach(async (user) => {
        await expect(loadProfile(user.id)).resolves.toMatchObject({
            id: user.id,
        });
    });
});
                `,
                errors: [{ messageId: "asyncForeachAssertion" }],
                name: "reports async forEach callbacks with awaited assertions",
            },
            {
                code: `
test("checks every token", async () => {
    tokens["forEach"](async function checkToken(token) {
        const result = await validateToken(token);

        expect(result.valid).toBe(true);
    });
});
                `,
                errors: [{ messageId: "asyncForeachAssertion" }],
                name: "reports computed forEach callbacks with assertions",
            },
            {
                code: `
it("checks records through optional chaining", () => {
    records?.forEach(async (record) => {
        expect(await normalize(record)).toEqual(record.expected);
    });
});
                `,
                errors: [{ messageId: "asyncForeachAssertion" }],
                name: "reports optional forEach callbacks with assertions",
            },
        ],
        valid: [
            {
                code: `
it("checks every user", async () => {
    for (const user of users) {
        await expect(loadProfile(user.id)).resolves.toMatchObject({
            id: user.id,
        });
    }
});
                `,
                name: "allows awaited for-of assertions",
            },
            {
                code: `
it("checks every user", async () => {
    await Promise.all(
        users.map(async (user) => {
            await expect(loadProfile(user.id)).resolves.toMatchObject({
                id: user.id,
            });
        })
    );
});
                `,
                name: "allows awaited Promise.all map assertions",
            },
            {
                code: `
it("warms every user cache", () => {
    users.forEach(async (user) => {
        await warmProfileCache(user.id);
    });

    expect(cache.size).toBe(users.length);
});
                `,
                name: "allows async forEach callbacks without assertions",
            },
            {
                code: `
it("checks every user synchronously", () => {
    users.forEach((user) => {
        expect(user.id).toBeTypeOf("string");
    });
});
                `,
                name: "allows synchronous forEach assertions",
            },
            {
                code: `
it("defines an assertion helper", () => {
    users.forEach(async (user) => {
        const assertProfile = () => {
            expect(user.id).toBeTypeOf("string");
        };

        await warmProfileCache(user.id);
        assertProfile();
    });
});
                `,
                name: "ignores assertions hidden in nested function definitions",
            },
            {
                code: `
users.forEach(async (user) => {
    expect(await loadProfile(user.id)).toBeDefined();
});
                `,
                name: "ignores async forEach outside executable tests",
            },
        ],
    }
);
