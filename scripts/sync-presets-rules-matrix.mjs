/**
 * Synchronize or validate presets documentation tables from canonical rule
 * metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";
import { generateReadmeRulesSectionFromRules } from "./sync-readme-rules-table.mjs";

/** @typedef {Readonly<Record<string, unknown>>} UnknownRecord */

/**
 * @typedef {"all"
 *     | "experimental"
 *     | "minimal"
 *     | "recommended"
 *     | "recommended-type-checked"
 *     | "strict"} PresetConfigName
 */

const matrixSectionHeading = "## Rule matrix";
const presetRulesSectionHeading = "## Rules in this preset";
const presetsDocsDirectoryPath = "docs/rules/presets";

const detectLineEnding = (markdown) =>
    markdown.includes("\r\n") ? "\r\n" : "\n";

const normalizeMarkdownLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

/** @type {Readonly<Record<PresetConfigName, string>>} */
const presetDocSlugByConfigName = {
    all: "all",
    experimental: "experimental",
    minimal: "minimal",
    recommended: "recommended",
    "recommended-type-checked": "recommended-type-checked",
    strict: "strict",
};

/** @type {readonly PresetConfigName[]} */
const presetConfigNames = [
    "all",
    "experimental",
    "minimal",
    "recommended",
    "recommended-type-checked",
    "strict",
];

const isUnknownRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const sortStrings = (values) =>
    [...values].toSorted((left, right) => left.localeCompare(right));

const toPluginRuleName = (configRuleKey) => {
    if (!configRuleKey.startsWith("test-signal/")) {
        return null;
    }

    return configRuleKey.slice("test-signal/".length);
};

const collectPresetRuleNames = (presetConfigName) => {
    const presetConfig = builtPlugin.configs[presetConfigName];

    if (!isUnknownRecord(presetConfig)) {
        throw new TypeError(
            `Missing preset config '${presetConfigName}' in built plugin.`
        );
    }

    const rules = presetConfig["rules"];

    if (!isUnknownRecord(rules)) {
        return [];
    }

    const names = Object.keys(rules)
        .map(toPluginRuleName)
        .filter((name) => typeof name === "string");

    return sortStrings(names);
};

const getRuleFixIndicator = (ruleModule) => {
    const fixable = ruleModule.meta?.fixable === "code";
    const hasSuggestions = ruleModule.meta?.hasSuggestions === true;

    if (fixable && hasSuggestions) {
        return "fix/suggest";
    }

    if (fixable) {
        return "fix";
    }

    if (hasSuggestions) {
        return "suggest";
    }

    return "-";
};

const getRuleModuleByName = (ruleName) => {
    const candidate = builtPlugin.rules[ruleName];

    if (!isUnknownRecord(candidate)) {
        throw new TypeError(`Rule '${ruleName}' is missing from built plugin.`);
    }

    return candidate;
};

const toPresetRuleRow = (ruleName) => {
    const ruleModule = getRuleModuleByName(ruleName);
    const docsUrl = ruleModule.meta?.docs?.url;

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
    }

    return `| [\`${ruleName}\`](${docsUrl}) | ${getRuleFixIndicator(ruleModule)} |`;
};

const createPresetRulesTable = (ruleNames) => {
    if (ruleNames.length === 0) {
        return [
            "| Rule | Fix |",
            "| --- | :-: |",
            "| - | - |",
        ].join("\n");
    }

    return [
        "| Rule | Fix |",
        "| --- | :-: |",
        ...ruleNames.map(toPresetRuleRow),
    ].join("\n");
};

const createFixLegendLines = () => [
    "- `Fix` legend:",
    "  - `fix` = autofixable",
    "  - `suggest` = suggestions available",
    "  - `-` = report only",
];

const generatePresetRulesSection = (presetConfigName) => {
    const presetRuleNames = collectPresetRuleNames(presetConfigName);

    return [
        presetRulesSectionHeading,
        "",
        ...createFixLegendLines(),
        "",
        createPresetRulesTable(presetRuleNames),
        "",
    ].join("\n");
};

const normalizeMarkdownTableSpacing = (markdown) =>
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
        .join("\n");

const findSectionBoundsByHeadings = (markdown, headingCandidates) => {
    const headingOffsets = headingCandidates
        .map((headingCandidate) => markdown.indexOf(headingCandidate))
        .filter((headingOffset) => headingOffset >= 0);

    if (headingOffsets.length === 0) {
        throw new Error(
            `Missing expected section heading. Tried: ${headingCandidates.join(
                ", "
            )}`
        );
    }

    const headingOffset = Math.min(...headingOffsets);
    const nextHeadingOffset = markdown.indexOf("\n## ", headingOffset + 1);

    return {
        headingOffset,
        sectionEndOffset:
            nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset + 1,
    };
};

const replaceMarkdownSection = ({
    generatedSection,
    headingCandidates,
    markdown,
}) => {
    const lineEnding = detectLineEnding(markdown);
    const { headingOffset, sectionEndOffset } = findSectionBoundsByHeadings(
        markdown,
        headingCandidates
    );
    const existingSection = markdown.slice(headingOffset, sectionEndOffset);

    if (
        normalizeMarkdownTableSpacing(existingSection) ===
        normalizeMarkdownTableSpacing(generatedSection)
    ) {
        return {
            changed: false,
            nextMarkdown: markdown,
        };
    }

    const markdownPrefix = markdown.slice(0, headingOffset).trimEnd();
    const markdownSuffix = markdown.slice(sectionEndOffset);
    const nextMarkdown = normalizeMarkdownLineEndings(
        `${markdownPrefix}\n\n${generatedSection}` + markdownSuffix,
        lineEnding
    );

    return {
        changed: true,
        nextMarkdown,
    };
};

export const generatePresetsRulesMatrixSectionFromRules = (rules) => {
    const readmeRulesSection = generateReadmeRulesSectionFromRules(rules)
        .replaceAll("\r\n", "\n")
        .split("\n");
    const rulesBodyWithoutHeading = readmeRulesSection.slice(2);

    return [
        matrixSectionHeading,
        "",
        ...rulesBodyWithoutHeading,
    ].join("\n");
};

const syncPresetsRulesMatrixSection = async ({
    workspaceRoot,
    writeChanges,
}) => {
    const presetsIndexPath = resolve(
        workspaceRoot,
        "docs/rules/presets/index.md"
    );
    const presetsIndexMarkdown = await readFile(presetsIndexPath, "utf8");
    const generatedSection = generatePresetsRulesMatrixSectionFromRules(
        builtPlugin.rules
    );
    const sectionReplacementResult = replaceMarkdownSection({
        generatedSection,
        headingCandidates: [matrixSectionHeading],
        markdown: presetsIndexMarkdown,
    });

    if (!sectionReplacementResult.changed) {
        return {
            changed: false,
        };
    }

    if (writeChanges) {
        await writeFile(
            presetsIndexPath,
            sectionReplacementResult.nextMarkdown,
            "utf8"
        );
    }

    return {
        changed: true,
    };
};

const syncPresetPageRuleTables = async ({ workspaceRoot, writeChanges }) => {
    let changed = false;

    for (const presetConfigName of presetConfigNames) {
        const presetDocPath = resolve(
            workspaceRoot,
            presetsDocsDirectoryPath,
            `${presetDocSlugByConfigName[presetConfigName]}.md`
        );
        const presetMarkdown = await readFile(presetDocPath, "utf8");
        const generatedSection = generatePresetRulesSection(presetConfigName);
        const replacementResult = replaceMarkdownSection({
            generatedSection,
            headingCandidates: [presetRulesSectionHeading],
            markdown: presetMarkdown,
        });

        if (!replacementResult.changed) {
            continue;
        }

        changed = true;

        if (writeChanges) {
            await writeFile(
                presetDocPath,
                replacementResult.nextMarkdown,
                "utf8"
            );
        }
    }

    return {
        changed,
    };
};

const syncPresetsDocs = async ({ writeChanges }) => {
    const workspaceRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const presetsMatrixResult = await syncPresetsRulesMatrixSection({
        workspaceRoot,
        writeChanges,
    });
    const presetPagesResult = await syncPresetPageRuleTables({
        workspaceRoot,
        writeChanges,
    });

    return {
        changed: presetsMatrixResult.changed || presetPagesResult.changed,
    };
};

const runCli = async () => {
    const writeChanges = process.argv.includes("--write");
    const result = await syncPresetsDocs({ writeChanges });

    if (!result.changed) {
        console.log("Presets documentation tables are already synchronized.");
        return;
    }

    if (writeChanges) {
        console.log(
            "Presets documentation tables synchronized from plugin metadata."
        );
        return;
    }

    console.error(
        "Presets documentation tables are out of sync. Run: node scripts/sync-presets-rules-matrix.mjs --write"
    );
    process.exitCode = 1;
};

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
