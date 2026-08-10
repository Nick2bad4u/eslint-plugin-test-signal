/**
 * @packageDocumentation
 * Focused option coverage for the custom rule-doc remark lint plugin.
 */
import { remark } from "remark";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";

import remarkLintRuleDocHeadings from "../scripts/remark-lint-rule-doc-headings.mjs";

const validRuleDocMarkdown = `# prefer-demo

Short rule description.

## Targeted pattern scope

Describe the narrow pattern.

## What this rule reports

Describe the reported pattern.

## Why this rule exists

Explain the rationale.

## ❌ Incorrect

\`\`\`ts
demoBad();
\`\`\`

## ✅ Correct

\`\`\`ts
demoGood();
\`\`\`

## Further reading

- [Example](https://example.com)
`;

const invalidRuleDocMarkdown = `# wrong-title

## What this rule reports

Describe the reported pattern.

## Targeted pattern scope

Describe the narrow pattern.

## Why this rule exists

### Detection boundaries

Describe a boundary.

### Matched patterns

Describe a matched pattern.

## Why this rule exists

Duplicate rationale.

## Unexpected section

Unexpected content.

## Deprecated

No replacement link is present.

## Further reading

- No links yet.

## Package documentation

No package documentation label is present.
`;

type RunLintOptions = Parameters<typeof remarkLintRuleDocHeadings>[0];

/**
 * Run the custom remark rule-doc headings plugin against markdown content.
 *
 * @param markdown - Markdown content to lint.
 * @param options - Plugin options under test.
 *
 * @returns Collected message reasons.
 */
const getLintMessageReasons = (
    markdown: string,
    options: Readonly<RunLintOptions>
): readonly string[] => {
    const file = new VFile({
        path: "docs/rules/prefer-demo.md",
        value: markdown,
    });
    const tree = remark().parse(file);
    const transformer = remarkLintRuleDocHeadings(options);

    transformer(tree, file);

    return file.messages.map(({ reason }) => reason);
};

describe("remark-lint-rule-doc-headings", () => {
    it("accepts a canonical rule document", () => {
        expect.hasAssertions();

        expect(getLintMessageReasons(validRuleDocMarkdown, {})).toStrictEqual(
            []
        );
    });

    it("does not require a rule catalog id when the option is disabled", () => {
        expect.hasAssertions();

        const messageReasons = getLintMessageReasons(validRuleDocMarkdown, {
            requireRuleCatalogId: false,
        });

        expect(messageReasons).not.toContain(
            "Missing required rule catalog marker line `> **Rule catalog ID:** R###`."
        );
    });

    it("requires a rule catalog id when the option is enabled", () => {
        expect.hasAssertions();

        const messageReasons = getLintMessageReasons(validRuleDocMarkdown, {
            requireRuleCatalogId: true,
        });

        expect(messageReasons).toContain(
            "Missing required rule catalog marker line `> **Rule catalog ID:** R###`."
        );
    });

    it("preserves diagnostics across the extracted validation stages", () => {
        expect.hasAssertions();

        const messageReasons = getLintMessageReasons(invalidRuleDocMarkdown, {
            requirePackageDocumentation: true,
            requirePackageDocumentationLabel: true,
            requireRuleCatalogId: true,
        });

        expect(messageReasons).toStrictEqual([
            "H1 heading must match one of: `prefer-demo`, `test-signal/prefer-demo`.",
            "Duplicate H2 heading `Why this rule exists` is not allowed.",
            "`### Detection boundaries` must be placed under `## Targeted pattern scope` or `## What this rule reports`.",
            "`### Matched patterns` must be placed under `## Targeted pattern scope` or `## What this rule reports`.",
            "`### Detection boundaries` must appear after `### Matched patterns` when both are present.",
            "Heading `Targeted pattern scope` is out of order. Follow the canonical helper-doc sequence.",
            "Unexpected H2 heading `Unexpected section`. Allowed helper-doc headings: Targeted pattern scope, What this rule reports, Why this rule exists, ❌ Incorrect, ✅ Correct, Deprecated, Behavior and migration notes, Additional examples, ESLint flat config example, When not to use it, Package documentation, Further reading, Adoption resources.",
            "Heading `Package documentation` is out of order. Follow the canonical helper-doc sequence.",
            "Missing required H2 heading `❌ Incorrect`.",
            "Missing required H2 heading `✅ Correct`.",
            "`## Targeted pattern scope` must be the first H2 section.",
            "`## What this rule reports` must immediately follow `## Targeted pattern scope`.",
            "`## Package documentation` must appear immediately before `## Further reading`.",
            "`## Deprecated` should include a link to the recommended replacement rule or package.",
            "`## Package documentation` must include at least one `<package> package documentation:` label line.",
            "Missing required rule catalog marker line `> **Rule catalog ID:** R###`.",
        ]);
    });
});
