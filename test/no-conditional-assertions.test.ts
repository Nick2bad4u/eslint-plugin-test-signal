/**
 * @packageDocumentation
 * RuleTester coverage for no-conditional-assertions.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-conditional-assertions",
    getPluginRule("no-conditional-assertions"),
    {
        invalid: [
            {
                code: `
it("checks optional payload", () => {
    const payload = readPayload();

    if (payload !== undefined) {
        expect(payload.id).toBe("abc");
    }
});
                `,
                errors: [{ messageId: "conditionalAssertion" }],
                name: "reports assertions inside if branches",
            },
            {
                code: `
it("checks fallback payload", () => {
    const payload = readPayload();

    payload === undefined
        ? expect(readFallback()).toBe("fallback")
        : expect(payload.id).toBe("abc");
});
                `,
                errors: [
                    { messageId: "conditionalAssertion" },
                    { messageId: "conditionalAssertion" },
                ],
                name: "reports assertions inside conditional expressions",
            },
            {
                code: `
test("checks optional metrics", () => {
    const metrics = readMetrics();

    metrics.enabled && expect(metrics.count).toBeGreaterThan(0);
});
                `,
                errors: [{ messageId: "conditionalAssertion" }],
                name: "reports assertions behind logical short-circuiting",
            },
            {
                code: `
it("checks status payload", () => {
    switch (readStatus()) {
        case "ready":
            expect(readPayload()).toBeDefined();
            break;
        default:
            expect(readPayload()).toBeUndefined();
    }
});
                `,
                errors: [
                    { messageId: "conditionalAssertion" },
                    { messageId: "conditionalAssertion" },
                ],
                name: "reports assertions inside switch cases",
            },
        ],
        valid: [
            {
                code: `
it("checks required payload", () => {
    const payload = readPayload();

    expect(payload.id).toBe("abc");
});
                `,
                name: "allows unconditional assertions",
            },
            {
                code: `
it("normalizes payload before assertion", () => {
    const payload = readPayload() ?? createFallbackPayload();

    expect(payload.id).toBe("abc");
});
                `,
                name: "allows conditional setup before an unconditional assertion",
            },
            {
                code: `
it.skip("documents an intentionally skipped branch", () => {
    if (readPayload() !== undefined) {
        expect(readPayload()).toBeDefined();
    }
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
