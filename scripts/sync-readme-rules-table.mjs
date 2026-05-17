/**
 * Synchronize or validate the README rules matrix from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import builtPlugin from "../dist/plugin.js";
import {
    testSignalConfigMetadataByName,
    testSignalConfigNamesByReadmeOrder,
    testSignalConfigReferenceToName,
} from "../dist/_internal/test-signal-config-references.js";

/**
 * @typedef {Readonly<{
 *     meta?: {
 *         docs?: {
 *             testSignalConfigs?: readonly string[] | string;
 *             url?: string;
 *         } | undefined;
 *         fixable?: string | undefined;
 *         hasSuggestions?: boolean | undefined;
 *     } | undefined;
 * }>} ReadmeRuleModule
 */

/** @typedef {Readonly<Record<string, unknown>>} ReadmeRulesMap */
/** @typedef {import("../dist/_internal/test-signal-config-references.js").TestSignalConfigName} PresetName */

const isObjectRecord = (value) => typeof value === "object" && value !== null;

const getRuleModuleMeta = (ruleModule) => {
    if (!isObjectRecord(ruleModule)) {
        return undefined;
    }

    const meta = /** @type {Readonly<Record<string, unknown>>} */ (ruleModule)[
        "meta"
    ];

    return isObjectRecord(meta)
        ? /** @type {ReadmeRuleModule["meta"]} */ (meta)
        : undefined;
};

const presetOrder = [...testSignalConfigNamesByReadmeOrder];
const presetNameSet = new Set(presetOrder);
const rulesSectionHeading = "## Rules";
const PRESET_DOCS_URL_BASE =
    "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets";

const detectLineEnding = (markdown) =>
    markdown.includes("\r\n") ? "\r\n" : "\n";

const normalizeMarkdownLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

const getReadmeRulesSectionBounds = (markdown) => {
    const startOffset = markdown.indexOf(rulesSectionHeading);

    if (startOffset < 0) {
        throw new Error("README.md is missing the '## Rules' section heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        startOffset + rulesSectionHeading.length
    );

    return {
        endOffset: nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset,
        startOffset,
    };
};

export const extractReadmeRulesSection = (markdown) => {
    const { endOffset, startOffset } = getReadmeRulesSectionBounds(markdown);

    return markdown.slice(startOffset, endOffset);
};

export const normalizeRulesSectionMarkdown = (markdown) =>
    markdown
        .replace(/\r\n/gv, "\n")
        .split("\n")
        .map((line) => {
            const trimmedLine = line.trimEnd();

            if (!/^\|.*\|$/v.test(trimmedLine)) {
                return trimmedLine;
            }

            const cells = trimmedLine
                .split("|")
                .slice(1, -1)
                .map((cell) => {
                    const trimmedCell = cell.trim();

                    if (!/^:?-+:?$/v.test(trimmedCell)) {
                        return trimmedCell;
                    }

                    const hasStartColon = trimmedCell.startsWith(":");
                    const hasEndColon = trimmedCell.endsWith(":");

                    if (hasStartColon && hasEndColon) {
                        return ":-:";
                    }

                    if (hasStartColon) {
                        return ":--";
                    }

                    if (hasEndColon) {
                        return "--:";
                    }

                    return "---";
                });

            return `| ${cells.join(" | ")} |`;
        })
        .join("\n")
        .trimEnd();

/** @type {Readonly<Record<PresetName, string>>} */
const presetDocsSlugByName = {
    all: "all",
    experimental: "experimental",
    minimal: "minimal",
    recommended: "recommended",
    "recommended-type-checked": "recommended-type-checked",
    strict: "strict",
};

/** @type {Readonly<Record<PresetName, string>>} */
const presetConfigReferenceByName = {
    all: "testSignal.configs.all",
    experimental: "testSignal.configs.experimental",
    minimal: "testSignal.configs.minimal",
    recommended: "testSignal.configs.recommended",
    "recommended-type-checked":
        'testSignal.configs["recommended-type-checked"]',
    strict: "testSignal.configs.strict",
};

const createPresetDocsUrl = (presetName) =>
    `${PRESET_DOCS_URL_BASE}/${presetDocsSlugByName[presetName]}`;

const createPresetLegendLines = () =>
    presetOrder.map((presetName) => {
        const docsUrl = createPresetDocsUrl(presetName);
        const presetIcon = testSignalConfigMetadataByName[presetName].icon;
        const configReference = presetConfigReferenceByName[presetName];

        return `  - [${presetIcon}](${docsUrl}) - [\`${configReference}\`](${docsUrl})`;
    });

const normalizeTestSignalConfigName = (reference) => {
    if (Object.hasOwn(testSignalConfigReferenceToName, reference)) {
        const referenceKey =
            /** @type {keyof typeof testSignalConfigReferenceToName} */ (
                reference
            );

        return testSignalConfigReferenceToName[referenceKey];
    }

    const presetName = /** @type {PresetName} */ (reference);

    return presetNameSet.has(presetName) ? presetName : null;
};

const normalizeTestSignalConfigNames = (testSignalConfigs) => {
    const references = Array.isArray(testSignalConfigs)
        ? testSignalConfigs
        : [testSignalConfigs];
    /** @type {PresetName[]} */
    const names = [];
    /** @type {Set<PresetName>} */
    const seenPresetNames = new Set();

    for (const reference of references) {
        if (typeof reference !== "string") {
            continue;
        }

        const configName = normalizeTestSignalConfigName(reference);

        if (configName === null || seenPresetNames.has(configName)) {
            continue;
        }

        seenPresetNames.add(configName);
        names.push(configName);
    }

    return names;
};

const getRuleFixIndicator = (ruleModule) => {
    const ruleMeta = getRuleModuleMeta(ruleModule);
    const fixable = ruleMeta?.fixable === "code";
    const hasSuggestions = ruleMeta?.hasSuggestions === true;

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

const getPresetIndicator = (ruleModule) => {
    const docsTestSignalConfigs =
        getRuleModuleMeta(ruleModule)?.docs?.testSignalConfigs;
    const presetNames = normalizeTestSignalConfigNames(docsTestSignalConfigs);
    const presetNamesSet = new Set(presetNames);
    /** @type {string[]} */
    const icons = [];

    for (const presetName of presetOrder) {
        if (presetNamesSet.has(presetName)) {
            const docsUrl = createPresetDocsUrl(presetName);
            const presetIcon = testSignalConfigMetadataByName[presetName].icon;

            icons.push(`[${presetIcon}](${docsUrl})`);
        }
    }

    return icons.length === 0 ? "-" : icons.join(" ");
};

const toRuleTableRow = ([ruleName, ruleModule]) => {
    const docsUrl = getRuleModuleMeta(ruleModule)?.docs?.url;

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
    }

    return `| [\`${ruleName}\`](${docsUrl}) | ${getRuleFixIndicator(ruleModule)} | ${getPresetIndicator(ruleModule)} |`;
};

/**
 * Generate the README rules section from plugin rule metadata.
 *
 * @param {ReadmeRulesMap} rules - Rule map keyed by unqualified rule name.
 *
 * @returns {string} Generated markdown section.
 */
export const generateReadmeRulesSectionFromRules = (rules) => {
    const ruleEntries = Object.entries(rules).toSorted((left, right) =>
        left[0].localeCompare(right[0])
    );
    const rows = ruleEntries.map(toRuleTableRow);

    return [
        "## Rules",
        "",
        "- `Fix` legend:",
        "  - `fix` = autofixable",
        "  - `suggest` = suggestions available",
        "  - `-` = report only",
        "- `Preset key` legend:",
        ...createPresetLegendLines(),
        "",
        "| Rule | Fix | Preset key |",
        "| --- | :-: | :-- |",
        ...rows,
        "",
    ].join("\n");
};

export const syncReadmeRulesTable = async ({ writeChanges }) => {
    const workspaceRoot = resolve(fileURLToPath(import.meta.url), "../..");
    const readmePath = resolve(workspaceRoot, "README.md");
    const readmeText = await readFile(readmePath, "utf8");
    const lineEnding = detectLineEnding(readmeText);
    const { endOffset, startOffset } = getReadmeRulesSectionBounds(readmeText);
    const readmePrefix = readmeText.slice(0, startOffset).trimEnd();
    const readmeSuffix = readmeText.slice(endOffset);
    const generatedRulesSection = generateReadmeRulesSectionFromRules(
        /** @type {ReadmeRulesMap} */ (builtPlugin.rules)
    );
    const existingRulesSection = extractReadmeRulesSection(readmeText);

    if (
        normalizeRulesSectionMarkdown(existingRulesSection) ===
        normalizeRulesSectionMarkdown(generatedRulesSection)
    ) {
        return {
            changed: false,
        };
    }

    const nextReadmeText = normalizeMarkdownLineEndings(
        `${readmePrefix}\n\n${generatedRulesSection}${readmeSuffix}`,
        lineEnding
    );

    if (!writeChanges) {
        return {
            changed: readmeText !== nextReadmeText,
        };
    }

    await writeFile(readmePath, nextReadmeText, "utf8");

    return {
        changed: readmeText !== nextReadmeText,
    };
};

const runCli = async () => {
    const writeChanges = process.argv.includes("--write");
    const result = await syncReadmeRulesTable({ writeChanges });

    if (!result.changed) {
        console.log("README rules table is already synchronized.");
        return;
    }

    if (writeChanges) {
        console.log("README rules table synchronized from plugin metadata.");
        return;
    }

    console.error(
        "README rules table is out of sync. Run: npm run sync:readme-rules-table:write."
    );
    process.exitCode = 1;
};

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
