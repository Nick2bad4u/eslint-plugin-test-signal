/**
 * @packageDocumentation
 * Vitest coverage for rule documentation integrity.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { createRuleDocsUrl } from "../src/_internal/rule-docs-url";
import testSignalPlugin from "../src/plugin";
import { parseMarkdownHeadingsAtLevel } from "./_internal/markdown-headings";

interface RuleWithMeta {
    readonly meta?: {
        readonly docs?: {
            readonly description?: unknown;
            readonly url?: unknown;
        };
    };
}

/* eslint-disable perfectionist/sort-arrays -- The docs contract follows page order, not alphabetical order. */
const requiredRuleHeadings = [
    "Rule details",
    "Incorrect",
    "Correct",
    "What this rule reports",
    "Options",
    "When not to use it",
] as const;
/* eslint-enable perfectionist/sort-arrays -- Restore canonical sorted-array enforcement after the page-order contract. */

const ruleCatalogIdLinePattern = /^> \*\*Rule catalog ID:\*\* R\d{3}$/gmv;

const isRuleWithMeta = (value: unknown): value is RuleWithMeta =>
    typeof value === "object" && value !== null;

const parseH1Headings = (markdown: string): string[] => [
    ...parseMarkdownHeadingsAtLevel(markdown, 1),
];

const parseH2Headings = (markdown: string): string[] => [
    ...parseMarkdownHeadingsAtLevel(markdown, 2),
];

describe("test-signal rule docs", () => {
    it("every rule has a docs url and matching docs/rules/<id>.md file", () => {
        expect.hasAssertions();

        const docsDir = path.join(process.cwd(), "docs", "rules");

        for (const [ruleId, rule] of Object.entries(testSignalPlugin.rules)) {
            const docs = isRuleWithMeta(rule)
                ? (rule.meta?.docs ?? null)
                : null;
            const url = docs?.url;

            expect(url).toBe(createRuleDocsUrl(ruleId));
            expect(docs?.description).toBeTypeOf("string");
            expect(fs.existsSync(path.join(docsDir, `${ruleId}.md`))).toBeTruthy();
        }
    });

    it("rule docs keep the expected heading schema", async () => {
        expect.hasAssertions();

        const docsDir = path.join(process.cwd(), "docs", "rules");
        const ruleDocFiles = fs
            .readdirSync(docsDir)
            .filter(
                (entry) =>
                    entry.endsWith(".md") &&
                    Object.hasOwn(
                        testSignalPlugin.rules,
                        entry.replace(/\.md$/v, "")
                    )
            )
            .toSorted((left, right) => left.localeCompare(right));

        expect(ruleDocFiles).toHaveLength(
            Object.keys(testSignalPlugin.rules).length
        );

        for (const fileName of ruleDocFiles) {
            const markdown = await fs.promises.readFile(
                path.join(docsDir, fileName),
                "utf8"
            );
            const expectedRuleId = fileName.replace(/\.md$/v, "");
            const h1Headings = parseH1Headings(markdown);
            const h2Headings = parseH2Headings(markdown);

            expect(h1Headings).toStrictEqual([expectedRuleId]);

            for (const heading of requiredRuleHeadings) {
                expect(h2Headings).toContain(heading);
            }

            expect(markdown.match(ruleCatalogIdLinePattern) ?? []).toHaveLength(
                1
            );
        }
    });
});
