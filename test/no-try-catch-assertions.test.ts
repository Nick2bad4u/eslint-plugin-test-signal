/**
 * @packageDocumentation
 * RuleTester coverage for no-try-catch-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-try-catch-assertions",
    getPluginRule("no-try-catch-assertions"),
    {
        invalid: [
            {
                code: `
it("rejects invalid payloads", async () => {
    try {
        await submitPayload({});
    } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
    }
});
                `,
                errors: [{ messageId: "catchAssertion" }],
                name: "reports assertions inside catch blocks",
            },
            {
                code: `
test("keeps error details", async () => {
    try {
        await submitPayload({});
    } catch (error) {
        expect(error).toMatchObject({ code: "invalid_payload" });
        expect(error).toHaveProperty("details");
    }
});
                `,
                errors: [
                    { messageId: "catchAssertion" },
                    { messageId: "catchAssertion" },
                ],
                name: "reports every catch assertion",
            },
        ],
        valid: [
            {
                code: `
it("rejects invalid payloads", async () => {
    await expect(submitPayload({})).rejects.toThrow(ValidationError);
});
                `,
                name: "allows rejects assertions",
            },
            {
                code: `
it("checks captured errors after the catch", async () => {
    let caught: unknown;

    try {
        await submitPayload({});
    } catch (error) {
        caught = error;
    }

    expect(caught).toBeInstanceOf(ValidationError);
});
                `,
                name: "allows assertions after captured errors leave the catch",
            },
            {
                code: `
it.skip("documents an old rejection style", async () => {
    try {
        await submitPayload({});
    } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
    }
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
