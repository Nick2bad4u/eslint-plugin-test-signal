/**
 * @packageDocumentation
 * Contract test that keeps presets matrix synchronized with plugin metadata.
 */
/* eslint-disable vitest/no-conditional-tests -- Markdown normalization helpers contain conditionals but never register tests conditionally. */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { generatePresetsRulesMatrixSectionFromRules } from "../scripts/sync-presets-rules-matrix.mjs";
import testSignalPlugin from "../src/plugin";

const MATRIX_SECTION_HEADING = "## Rule matrix";

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

            if (cells.every((cell) => /^:?-+:?$/v.test(cell))) {
                return `| ${cells
                    .map((cell) => {
                        if (cell.startsWith(":") && cell.endsWith(":")) {
                            return ":-:";
                        }

                        if (cell.startsWith(":")) {
                            return ":--";
                        }

                        if (cell.endsWith(":")) {
                            return "--:";
                        }

                        return "---";
                    })
                    .join(" | ")} |`;
            }

            return `| ${cells.join(" | ")} |`;
        })
        .join("\n");

const extractMatrixSection = (markdown: string): string => {
    const headingOffset = markdown.indexOf(MATRIX_SECTION_HEADING);

    if (headingOffset === -1) {
        throw new Error(
            "docs/rules/presets/index.md is missing the `## Rule matrix` section heading."
        );
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        headingOffset + MATRIX_SECTION_HEADING.length
    );
    const sectionEndOffset =
        nextHeadingOffset === -1 ? markdown.length : nextHeadingOffset + 1;

    return markdown.slice(headingOffset, sectionEndOffset);
};

describe("presets rules matrix synchronization", () => {
    it("matches the canonical matrix generated from plugin metadata", async () => {
        expect.hasAssertions();

        const presetsIndexPath = path.join(
            process.cwd(),
            "docs",
            "rules",
            "presets",
            "index.md"
        );
        const presetsMarkdown = await fs.readFile(presetsIndexPath, "utf8");
        const presetsMatrixSection = extractMatrixSection(presetsMarkdown);
        const rules = testSignalPlugin.rules as unknown as Parameters<
            typeof generatePresetsRulesMatrixSectionFromRules
        >[0];
        const expectedMatrixSection =
            generatePresetsRulesMatrixSectionFromRules(rules);

        expect(normalizeMarkdownTableSpacing(presetsMatrixSection)).toBe(
            normalizeMarkdownTableSpacing(expectedMatrixSection)
        );
    });
});

/* eslint-enable vitest/no-conditional-tests -- Restore conditional-test enforcement after helper declarations. */
