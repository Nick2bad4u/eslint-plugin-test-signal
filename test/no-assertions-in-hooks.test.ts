/**
 * @packageDocumentation
 * RuleTester coverage for no-assertions-in-hooks.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-assertions-in-hooks",
    getPluginRule("no-assertions-in-hooks"),
    {
        invalid: [
            {
                code: `
beforeEach(() => {
    expect(console.error).not.toHaveBeenCalled();
});

it("renders the widget", () => {
    expect(renderWidget()).toMatchObject({ visible: true });
});
                `,
                errors: [{ messageId: "assertionInHook" }],
                name: "reports beforeEach assertions",
            },
            {
                code: `
afterEach(() => {
    expect(cleanupResult()).toBe("ok");
});
                `,
                errors: [{ messageId: "assertionInHook" }],
                name: "reports afterEach assertions",
            },
            {
                code: `
beforeAll(() => {
    expect.hasAssertions();
});
                `,
                errors: [{ messageId: "assertionInHook" }],
                name: "reports assertion count guards in hooks",
            },
            {
                code: `
afterAll(async () => {
    await expect(closeServer()).resolves.toBeUndefined();
});
                `,
                errors: [{ messageId: "assertionInHook" }],
                name: "reports async hook assertions",
            },
        ],
        valid: [
            {
                code: `
beforeEach(() => {
    vi.clearAllMocks();
});

it("renders the widget", () => {
    expect(renderWidget()).toMatchObject({ visible: true });
});
                `,
                name: "allows setup hooks without assertions",
            },
            {
                code: `
it("verifies cleanup", () => {
    cleanup();

    expect(cleanupResult()).toBe("ok");
});
                `,
                name: "allows explicit cleanup assertions in tests",
            },
            {
                code: `
beforeEach(() => {
    const assertNoConsoleErrors = () => {
        expect(console.error).not.toHaveBeenCalled();
    };

    vi.clearAllMocks();
    void assertNoConsoleErrors;
});
                `,
                name: "ignores assertions inside nested helper definitions",
            },
            {
                code: `
before(() => {
    expect(legacySetup()).toBe(true);
});
                `,
                name: "ignores non-Jest lifecycle names",
            },
        ],
    }
);
