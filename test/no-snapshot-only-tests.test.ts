/**
 * @packageDocumentation
 * RuleTester coverage for no-snapshot-only-tests.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-snapshot-only-tests",
    getPluginRule("no-snapshot-only-tests"),
    {
        invalid: [
            {
                code: `
it("renders the panel", () => {
    expect(renderPanel()).toMatchSnapshot();
});
                `,
                errors: [{ messageId: "snapshotOnlyTest" }],
                name: "reports snapshot-only tests",
            },
        ],
        valid: [
            {
                code: `
it("renders the panel", () => {
    const panel = renderPanel();

    expect(panel.role).toBe("alert");
    expect(panel).toMatchSnapshot();
});
                `,
                name: "allows snapshots with behavioral assertions",
            },
            {
                code: `
it.skip("keeps legacy snapshot", () => {
    expect(renderPanel()).toMatchSnapshot();
});
                `,
                name: "ignores skipped tests",
            },
        ],
    }
);
