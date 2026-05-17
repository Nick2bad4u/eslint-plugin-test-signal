/**
 * @packageDocumentation
 * Contract test that keeps README rule matrix synchronized with plugin metadata.
 */
/* eslint-disable vitest/no-conditional-tests -- Markdown synchronization helpers contain conditionals but never register tests conditionally. */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    generateReadmeRulesSectionFromRules,
    syncReadmeRulesTable,
} from "../scripts/sync-readme-rules-table.mjs";
import testSignalPlugin from "../src/plugin";

const RULES_SECTION_HEADING = "## Rules";
const SHOULD_SYNC_README_IN_UPDATE_MODE =
    process.argv.includes("-u") ||
    process.argv.includes("--update") ||
    // eslint-disable-next-line n/no-process-env -- The contract test supports an explicit docs-update mode in CI and local runs.
    process.env["TEST_SIGNAL_UPDATE_GENERATED_DOCS"] === "1";

const syncReadmeRulesTableIfRequested = async (): Promise<void> => {
    if (SHOULD_SYNC_README_IN_UPDATE_MODE) {
        await syncReadmeRulesTable({ writeChanges: true });
    }
};

const normalizeMarkdownTableSpacing = (markdown: string): string =>
    markdown
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => {
            const trimmedLine = line.trimEnd();

            if (!/^\|.*\|$/v.test(trimmedLine)) {
                return trimmedLine;
            }

            const cells = trimmedLine
                .split("|")
                .slice(1, -1)
                .map((cell) => cell.trim());

            return `| ${cells.join(" | ")} |`;
        })
        .join("\n")
        .trimEnd();

const extractRulesSection = (markdown: string): string => {
    const headingOffset = markdown.indexOf(RULES_SECTION_HEADING);

    if (headingOffset === -1) {
        throw new Error("README.md is missing the `## Rules` section heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        headingOffset + RULES_SECTION_HEADING.length
    );

    const sectionEndOffset =
        nextHeadingOffset === -1 ? markdown.length : nextHeadingOffset;

    return markdown.slice(headingOffset, sectionEndOffset);
};

describe("readme rules table synchronization", () => {
    it("matches the canonical rules matrix generated from plugin metadata", async () => {
        expect.hasAssertions();

        await syncReadmeRulesTableIfRequested();

        const readmePath = path.join(process.cwd(), "README.md");
        const readmeMarkdown = await fs.readFile(readmePath, "utf8");
        const readmeRulesSection = extractRulesSection(readmeMarkdown);
        const rules = testSignalPlugin.rules as unknown as Parameters<
            typeof generateReadmeRulesSectionFromRules
        >[0];
        const expectedRulesSection = generateReadmeRulesSectionFromRules(
            rules
        );

        expect(normalizeMarkdownTableSpacing(readmeRulesSection)).toBe(
            normalizeMarkdownTableSpacing(expectedRulesSection)
        );
    });
});

/* eslint-enable vitest/no-conditional-tests -- Restore conditional-test enforcement after helper declarations. */
