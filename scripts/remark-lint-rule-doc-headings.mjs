/**
 * @file Remark lint plugin enforcing canonical H2 heading order for helper
 *   docs.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** @typedef {import("mdast").Heading} Heading */
/** @typedef {import("mdast").Root} Root */
/** @typedef {import("unist").Node} Node */
/** @typedef {import("vfile").VFile} VFile */

/**
 * @typedef {object} PackageMetadata
 *
 * @property {unknown} [name] - Package name read from package metadata.
 */
/** @typedef {boolean | undefined} HeadingToggle */

/**
 * @typedef {{
 *     headings?: Partial<Record<string, HeadingToggle>>;
 *     helperDocPathPattern?: RegExp;
 *     requirePackageDocumentation?: boolean;
 *     requirePackageDocumentationLabel?: boolean;
 *     requireRuleCatalogId?: boolean;
 *     packageDocumentationLabelPattern?: RegExp;
 *     ruleCatalogIdLinePattern?: RegExp;
 *     ruleNamespaceAliases?: readonly string[];
 * }} RemarkLintRuleDocHeadingsOptions
 */

const canonicalHeadingDefinitions = [
    {
        heading: "Targeted pattern scope",
        key: "targetedPatternScope",
        requiredByDefault: true,
    },
    {
        heading: "What this rule reports",
        key: "whatThisRuleReports",
        requiredByDefault: true,
    },
    {
        heading: "Why this rule exists",
        key: "whyThisRuleExists",
        requiredByDefault: true,
    },
    { heading: "❌ Incorrect", key: "incorrect", requiredByDefault: true },
    { heading: "✅ Correct", key: "correct", requiredByDefault: true },
    { heading: "Deprecated", key: "deprecated", requiredByDefault: false },
    {
        heading: "Behavior and migration notes",
        key: "behaviorAndMigrationNotes",
        requiredByDefault: false,
    },
    {
        heading: "Additional examples",
        key: "additionalExamples",
        requiredByDefault: false,
    },
    {
        heading: "ESLint flat config example",
        key: "eslintFlatConfigExample",
        requiredByDefault: false,
    },
    {
        heading: "When not to use it",
        key: "whenNotToUseIt",
        requiredByDefault: false,
    },
    {
        heading: "Package documentation",
        key: "packageDocumentation",
        requiredByDefault: false,
    },
    {
        heading: "Further reading",
        key: "furtherReading",
        requiredByDefault: true,
    },
    {
        heading: "Adoption resources",
        key: "adoptionResources",
        requiredByDefault: false,
    },
];

const optionalDetailHeadingDefinitions = [
    { heading: "Matched patterns", key: "matchedPatterns" },
    { heading: "Detection boundaries", key: "detectionBoundaries" },
];

const canonicalHeadingOrder = canonicalHeadingDefinitions.map(
    (definition) => definition.heading
);

const canonicalHeadingDefinitionsByTitle = new Map(
    canonicalHeadingDefinitions.map((definition) => [
        definition.heading,
        definition,
    ])
);

const optionalDetailHeadingDefinitionsByTitle = new Map(
    optionalDetailHeadingDefinitions.map((definition) => [
        definition.heading,
        definition,
    ])
);

const defaultHeadingToggles = Object.freeze(
    Object.fromEntries(
        [
            ...canonicalHeadingDefinitions,
            ...optionalDetailHeadingDefinitions,
        ].map((definition) => [definition.key, true])
    )
);

const optionalDetailAllowedParentHeadings = new Set([
    "Targeted pattern scope",
    "What this rule reports",
]);

const defaultHelperDocPathPattern =
    /(^|\/)docs\/rules\/(?!overview\.md$|getting-started\.md$|presets\/)[^/]+\.md$/u;
const defaultRuleCatalogIdLinePattern = /^> \*\*Rule catalog ID:\*\* R\d{3}$/u;
const defaultPackageDocumentationLabelPattern =
    /^[^\r\n]{1,160} package documentation:$/mu;
const eslintPluginPackagePrefix = "eslint-plugin-";

const packageMetadataCache = new Map();

/**
 * @param {readonly string[]} directories
 * @param {PackageMetadata | undefined} packageMetadata
 */
const cachePackageMetadata = (directories, packageMetadata) => {
    for (const directory of directories) {
        packageMetadataCache.set(directory, packageMetadata);
    }
};

/**
 * @param {string} packageJsonPath
 *
 * @returns {PackageMetadata | undefined}
 */
const readPackageMetadata = (packageJsonPath) => {
    try {
        return /** @type {PackageMetadata} */ (
            JSON.parse(readFileSync(packageJsonPath, "utf8"))
        );
    } catch {
        return undefined;
    }
};

/**
 * @param {string} documentPath
 *
 * @returns {PackageMetadata | undefined}
 */
const getNearestPackageMetadata = (documentPath) => {
    const traversedDirectories = [];
    let currentDirectory = dirname(documentPath);

    while (true) {
        traversedDirectories.push(currentDirectory);

        if (packageMetadataCache.has(currentDirectory)) {
            const cachedPackageMetadata =
                packageMetadataCache.get(currentDirectory);

            cachePackageMetadata(traversedDirectories, cachedPackageMetadata);

            return cachedPackageMetadata;
        }

        const packageJsonPath = join(currentDirectory, "package.json");

        if (existsSync(packageJsonPath)) {
            const packageMetadata = readPackageMetadata(packageJsonPath);

            cachePackageMetadata(traversedDirectories, packageMetadata);

            return packageMetadata;
        }

        const parentDirectory = dirname(currentDirectory);

        if (parentDirectory === currentDirectory) {
            cachePackageMetadata(traversedDirectories, undefined);

            return undefined;
        }

        currentDirectory = parentDirectory;
    }
};

/**
 * @param {unknown} packageName
 *
 * @returns {packageName is string}
 */
const isPackageName = (packageName) => typeof packageName === "string";

/**
 * @param {string} packageName
 *
 * @returns {readonly string[]}
 */
const getRuleNamespaceAliasesFromPackageName = (packageName) => {
    const aliases = new Set();

    if (packageName.startsWith(eslintPluginPackagePrefix)) {
        const pluginName = packageName.slice(eslintPluginPackagePrefix.length);

        if (pluginName !== "") {
            aliases.add(pluginName);
        }

        return [...aliases];
    }

    if (!packageName.startsWith("@")) {
        return [...aliases];
    }

    const packageSeparatorIndex = packageName.indexOf("/");

    if (packageSeparatorIndex === -1) {
        return [...aliases];
    }

    const packageScope = packageName.slice(0, packageSeparatorIndex);
    const scopedPackageName = packageName.slice(packageSeparatorIndex + 1);

    if (!scopedPackageName.startsWith(eslintPluginPackagePrefix)) {
        return [...aliases];
    }

    const pluginName = scopedPackageName.slice(
        eslintPluginPackagePrefix.length
    );

    if (pluginName !== "") {
        aliases.add(pluginName);
        aliases.add(`${packageScope}/${pluginName}`);
    }

    return [...aliases];
};

/**
 * @param {string} fileRuleId
 * @param {readonly string[]} ruleNamespaceAliases
 *
 * @returns {readonly string[]}
 */
const getExpectedH1Titles = (fileRuleId, ruleNamespaceAliases) => {
    const expectedH1Titles = new Set([fileRuleId]);

    if (fileRuleId.startsWith("typescript-")) {
        expectedH1Titles.add(`typescript/${fileRuleId.slice(11)}`);
    }

    for (const ruleNamespaceAlias of ruleNamespaceAliases) {
        expectedH1Titles.add(`${ruleNamespaceAlias}/${fileRuleId}`);
    }

    return [...expectedH1Titles];
};

/**
 * @param {string} path
 *
 * @returns {string}
 */
const normalizePath = (path) => path.replaceAll("\\", "/");

/**
 * @param {unknown} value
 *
 * @returns {value is { value: string }}
 */
const hasValue = (value) =>
    typeof value === "object" && value !== null && "value" in value;

/**
 * @param {unknown} value
 *
 * @returns {value is { children: unknown[] }}
 */
const hasChildren = (value) =>
    typeof value === "object" && value !== null && "children" in value;

/**
 * @param {unknown} node
 *
 * @returns {string}
 */
const getNodeText = (node) => {
    if (hasValue(node) && typeof node.value === "string") {
        return node.value;
    }

    if (hasChildren(node) && Array.isArray(node.children)) {
        return node.children.map((child) => getNodeText(child)).join("");
    }

    return "";
};

/**
 * @param {unknown} value
 *
 * @returns {value is Root}
 */
const isRootNode = (value) =>
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "root" &&
    "children" in value &&
    Array.isArray(value.children);

/**
 * @param {unknown} node
 *
 * @returns {node is Heading}
 */
const isHeadingNode = (node) =>
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "heading" &&
    "depth" in node;

/**
 * @param {VFile} file
 * @param {Heading} sectionHeading
 * @param {Heading | undefined} nextSectionHeading
 *
 * @returns {string}
 */
const getSectionContent = (file, sectionHeading, nextSectionHeading) => {
    const sectionStartOffset = sectionHeading.position?.end?.offset;
    const nextSectionOffset = nextSectionHeading?.position?.start?.offset;
    const markdownStartOffset =
        typeof sectionStartOffset === "number" ? sectionStartOffset : 0;
    const markdownEndOffset =
        typeof nextSectionOffset === "number"
            ? nextSectionOffset
            : String(file).length;

    return String(file).slice(markdownStartOffset, markdownEndOffset);
};

/**
 * Check for at least one Markdown inline link without relying on a backtracking
 * regular expression.
 *
 * @param {string} markdown
 *
 * @returns {boolean}
 */
const hasMarkdownInlineLink = (markdown) => {
    let index = 0;

    while (index < markdown.length) {
        const labelStart = markdown.indexOf("[", index);

        if (labelStart === -1) {
            return false;
        }

        const labelEnd = markdown.indexOf("]", labelStart + 1);

        if (labelEnd !== -1 && markdown.charAt(labelEnd + 1) === "(") {
            const linkEnd = markdown.indexOf(")", labelEnd + 2);

            if (linkEnd !== -1) {
                return true;
            }
        }

        index = labelStart + 1;
    }

    return false;
};

/**
 * @param {Root} tree
 * @param {1 | 2} depth
 *
 * @returns {readonly Heading[]}
 */
const getHeadingsByDepth = (tree, depth) =>
    tree.children.filter(
        /**
         * @param {unknown} node
         *
         * @returns {node is Heading}
         */
        (node) =>
            typeof node === "object" &&
            node !== null &&
            "type" in node &&
            node.type === "heading" &&
            "depth" in node &&
            node.depth === depth
    );

/** @typedef {(headingKey: string) => boolean} HeadingEnabledPredicate */

/**
 * @typedef {object} RuleDocHeadingsConfiguration
 *
 * @property {boolean} requirePackageDocumentation
 * @property {boolean} requirePackageDocumentationLabel
 * @property {boolean} requireRuleCatalogId
 * @property {RegExp} packageDocumentationLabelPattern
 * @property {RegExp} ruleCatalogIdLinePattern
 * @property {HeadingEnabledPredicate} isHeadingEnabled
 * @property {ReadonlyMap<string, number>} headingOrderIndex
 * @property {ReadonlySet<string>} optionalDetailHeadings
 * @property {readonly (typeof canonicalHeadingDefinitions)[number][]} requiredCanonicalHeadings
 * @property {readonly string[]} ruleNamespaceAliases
 */

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h1Headings
 * @param {string | undefined} expectedRuleTitle
 * @param {readonly string[]} ruleNamespaceAliases
 */
const reportH1HeadingIssues = (
    file,
    h1Headings,
    expectedRuleTitle,
    ruleNamespaceAliases
) => {
    if (h1Headings.length !== 1) {
        file.message(
            "Helper docs must contain exactly one H1 heading.",
            h1Headings[0],
            "remark-lint:rule-doc-headings:h1-count"
        );
    }

    if (h1Headings.length !== 1 || expectedRuleTitle === undefined) {
        return;
    }

    const actualTitle = getNodeText(h1Headings[0]).trim();
    const expectedH1Titles = getExpectedH1Titles(
        expectedRuleTitle,
        ruleNamespaceAliases
    );

    if (!expectedH1Titles.includes(actualTitle)) {
        const expectedH1TitleList = expectedH1Titles
            .map((title) => `\`${title}\``)
            .join(", ");
        file.message(
            `H1 heading must match one of: ${expectedH1TitleList}.`,
            h1Headings[0],
            "remark-lint:rule-doc-headings:h1-title"
        );
    }
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {readonly string[]} headingNames
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportDuplicateHeadingIssues = (
    file,
    h2Headings,
    headingNames,
    isHeadingEnabled
) => {
    const seenHeadings = new Set();

    for (const [index, headingName] of headingNames.entries()) {
        const headingDefinition =
            canonicalHeadingDefinitionsByTitle.get(headingName);

        if (
            headingDefinition !== undefined &&
            !isHeadingEnabled(headingDefinition.key)
        ) {
            continue;
        }

        if (seenHeadings.has(headingName)) {
            file.message(
                `Duplicate H2 heading \`${headingName}\` is not allowed.`,
                h2Headings[index],
                "remark-lint:rule-doc-headings:duplicate-heading"
            );
            continue;
        }

        seenHeadings.add(headingName);
    }
};

/**
 * @param {unknown} node
 * @param {ReadonlySet<string>} optionalDetailHeadings
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 *
 * @returns {node is Heading}
 */
const isEnabledOptionalDetailHeading = (
    node,
    optionalDetailHeadings,
    isHeadingEnabled
) => {
    if (!isHeadingNode(node) || node.depth !== 3) {
        return false;
    }

    const headingName = getNodeText(node).trim();
    const headingDefinition =
        optionalDetailHeadingDefinitionsByTitle.get(headingName);

    return (
        headingDefinition !== undefined &&
        isHeadingEnabled(headingDefinition.key) &&
        optionalDetailHeadings.has(headingName)
    );
};

/**
 * @param {Root} tree
 * @param {VFile} file
 * @param {ReadonlySet<string>} optionalDetailHeadings
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportDetailHeadingParentIssues = (
    tree,
    file,
    optionalDetailHeadings,
    isHeadingEnabled
) => {
    let currentH2HeadingName;

    for (const node of tree.children) {
        if (!isHeadingNode(node)) {
            continue;
        }

        const headingName = getNodeText(node).trim();

        if (node.depth === 2) {
            currentH2HeadingName = headingName;
            continue;
        }

        if (
            !isEnabledOptionalDetailHeading(
                node,
                optionalDetailHeadings,
                isHeadingEnabled
            )
        ) {
            continue;
        }

        if (
            currentH2HeadingName === undefined ||
            !optionalDetailAllowedParentHeadings.has(currentH2HeadingName)
        ) {
            file.message(
                `\`### ${headingName}\` must be placed under \`## Targeted pattern scope\` or \`## What this rule reports\`.`,
                node,
                "remark-lint:rule-doc-headings:detail-heading-parent"
            );
        }
    }
};

/**
 * @param {Root} tree
 * @param {VFile} file
 * @param {ReadonlySet<string>} optionalDetailHeadings
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportDetailHeadingOrderIssues = (
    tree,
    file,
    optionalDetailHeadings,
    isHeadingEnabled
) => {
    let detectionBoundariesHeadingIndex = -1;
    let matchedPatternsHeadingIndex = -1;

    for (const [index, node] of tree.children.entries()) {
        if (
            !isEnabledOptionalDetailHeading(
                node,
                optionalDetailHeadings,
                isHeadingEnabled
            )
        ) {
            continue;
        }

        const headingName = getNodeText(node).trim();

        if (headingName === "Matched patterns") {
            matchedPatternsHeadingIndex = index;
        }

        if (headingName === "Detection boundaries") {
            detectionBoundariesHeadingIndex = index;
        }
    }

    if (
        detectionBoundariesHeadingIndex !== -1 &&
        matchedPatternsHeadingIndex !== -1 &&
        detectionBoundariesHeadingIndex < matchedPatternsHeadingIndex
    ) {
        file.message(
            "`### Detection boundaries` must appear after `### Matched patterns` when both are present.",
            tree.children[detectionBoundariesHeadingIndex],
            "remark-lint:rule-doc-headings:detail-heading-order"
        );
    }
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {readonly string[]} headingNames
 * @param {ReadonlyMap<string, number>} headingOrderIndex
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportHeadingOrderIssues = (
    file,
    h2Headings,
    headingNames,
    headingOrderIndex,
    isHeadingEnabled
) => {
    let lastOrder = -1;

    for (const [index, headingName] of headingNames.entries()) {
        const headingDefinition =
            canonicalHeadingDefinitionsByTitle.get(headingName);

        if (
            headingDefinition !== undefined &&
            !isHeadingEnabled(headingDefinition.key)
        ) {
            continue;
        }

        const headingOrder = headingOrderIndex.get(headingName);
        const headingNode = h2Headings[index];

        if (headingOrder === undefined) {
            file.message(
                `Unexpected H2 heading \`${headingName}\`. Allowed helper-doc headings: ${canonicalHeadingOrder.join(", ")}.`,
                headingNode,
                "remark-lint:rule-doc-headings:unknown-heading"
            );
            continue;
        }

        if (headingOrder < lastOrder) {
            file.message(
                `Heading \`${headingName}\` is out of order. Follow the canonical helper-doc sequence.`,
                headingNode,
                "remark-lint:rule-doc-headings:order"
            );
        }

        lastOrder = headingOrder;
    }
};

/**
 * @param {VFile} file
 * @param {readonly string[]} headingNames
 * @param {readonly (typeof canonicalHeadingDefinitions)[number][]} requiredCanonicalHeadings
 */
const reportMissingRequiredHeadingIssues = (
    file,
    headingNames,
    requiredCanonicalHeadings
) => {
    for (const requiredHeading of requiredCanonicalHeadings) {
        if (!headingNames.includes(requiredHeading.heading)) {
            file.message(
                `Missing required H2 heading \`${requiredHeading.heading}\`.`,
                undefined,
                "remark-lint:rule-doc-headings:missing-required"
            );
        }
    }
};

/**
 * @param {readonly Heading[]} h2Headings
 * @param {number} index
 *
 * @returns {Heading | undefined}
 */
const getH2HeadingNodeAt = (h2Headings, index) =>
    index >= 0 && index < h2Headings.length ? h2Headings[index] : undefined;

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {readonly string[]} headingNames
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportLeadingHeadingIssues = (
    file,
    h2Headings,
    headingNames,
    isHeadingEnabled
) => {
    const targetedPatternScopeIndex = headingNames.indexOf(
        "Targeted pattern scope"
    );
    const whatThisRuleReportsIndex = headingNames.indexOf(
        "What this rule reports"
    );
    const firstH2HeadingNode = h2Headings[0];

    if (
        isHeadingEnabled("targetedPatternScope") &&
        targetedPatternScopeIndex !== 0
    ) {
        const headingNode =
            getH2HeadingNodeAt(h2Headings, targetedPatternScopeIndex) ??
            getH2HeadingNodeAt(h2Headings, whatThisRuleReportsIndex) ??
            firstH2HeadingNode;

        file.message(
            "`## Targeted pattern scope` must be the first H2 section.",
            headingNode,
            "remark-lint:rule-doc-headings:targeted-scope-position"
        );
    }

    if (
        isHeadingEnabled("targetedPatternScope") &&
        isHeadingEnabled("whatThisRuleReports") &&
        whatThisRuleReportsIndex !== targetedPatternScopeIndex + 1
    ) {
        const headingNode =
            getH2HeadingNodeAt(h2Headings, whatThisRuleReportsIndex) ??
            getH2HeadingNodeAt(h2Headings, targetedPatternScopeIndex) ??
            firstH2HeadingNode;

        file.message(
            "`## What this rule reports` must immediately follow `## Targeted pattern scope`.",
            headingNode,
            "remark-lint:rule-doc-headings:targeted-scope-adjacent"
        );
    }
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {number} deprecatedSectionIndex
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportDeprecatedSectionIssues = (
    file,
    h2Headings,
    deprecatedSectionIndex,
    isHeadingEnabled
) => {
    if (!isHeadingEnabled("deprecated") || deprecatedSectionIndex === -1) {
        return;
    }

    const deprecatedSectionHeading = h2Headings[deprecatedSectionIndex];

    if (deprecatedSectionHeading === undefined) {
        return;
    }

    const deprecatedSectionContent = getSectionContent(
        file,
        deprecatedSectionHeading,
        h2Headings[deprecatedSectionIndex + 1]
    );

    if (!hasMarkdownInlineLink(deprecatedSectionContent)) {
        file.message(
            "`## Deprecated` should include a link to the recommended replacement rule or package.",
            deprecatedSectionHeading,
            "remark-lint:rule-doc-headings:deprecated-replacement-link"
        );
    }
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {number} packageDocumentationIndex
 * @param {number} furtherReadingIndex
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportPackageDocumentationPlacementIssues = (
    file,
    h2Headings,
    packageDocumentationIndex,
    furtherReadingIndex,
    isHeadingEnabled
) => {
    if (
        isHeadingEnabled("packageDocumentation") &&
        isHeadingEnabled("furtherReading") &&
        packageDocumentationIndex !== -1 &&
        furtherReadingIndex !== -1 &&
        packageDocumentationIndex !== furtherReadingIndex - 1
    ) {
        file.message(
            "`## Package documentation` must appear immediately before `## Further reading`.",
            h2Headings[packageDocumentationIndex],
            "remark-lint:rule-doc-headings:package-placement"
        );
    }
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {number} packageDocumentationIndex
 * @param {boolean} requirePackageDocumentationLabel
 * @param {RegExp} packageDocumentationLabelPattern
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportPackageDocumentationLabelIssues = (
    file,
    h2Headings,
    packageDocumentationIndex,
    requirePackageDocumentationLabel,
    packageDocumentationLabelPattern,
    isHeadingEnabled
) => {
    if (
        !isHeadingEnabled("packageDocumentation") ||
        !requirePackageDocumentationLabel ||
        packageDocumentationIndex === -1
    ) {
        return;
    }

    const packageDocumentationHeading = h2Headings[packageDocumentationIndex];

    if (packageDocumentationHeading === undefined) {
        return;
    }

    const packageDocumentationContent = getSectionContent(
        file,
        packageDocumentationHeading,
        h2Headings[packageDocumentationIndex + 1]
    );

    if (!packageDocumentationLabelPattern.test(packageDocumentationContent)) {
        file.message(
            "`## Package documentation` must include at least one `<package> package documentation:` label line.",
            packageDocumentationHeading,
            "remark-lint:rule-doc-headings:package-docs-label"
        );
    }
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {readonly string[]} headingNames
 * @param {boolean} requirePackageDocumentation
 * @param {HeadingEnabledPredicate} isHeadingEnabled
 */
const reportMissingOptionalHeadingIssues = (
    file,
    h2Headings,
    headingNames,
    requirePackageDocumentation,
    isHeadingEnabled
) => {
    const packageDocumentationIndex = headingNames.indexOf(
        "Package documentation"
    );
    const furtherReadingIndex = headingNames.indexOf("Further reading");

    if (
        isHeadingEnabled("packageDocumentation") &&
        requirePackageDocumentation &&
        packageDocumentationIndex === -1
    ) {
        file.message(
            "Missing required `## Package documentation` section.",
            undefined,
            "remark-lint:rule-doc-headings:missing-package-docs"
        );
    }

    if (isHeadingEnabled("furtherReading") && furtherReadingIndex === -1) {
        file.message(
            "Missing required `## Further reading` section.",
            undefined,
            "remark-lint:rule-doc-headings:missing-further-reading"
        );
    }

    reportPackageDocumentationPlacementIssues(
        file,
        h2Headings,
        packageDocumentationIndex,
        furtherReadingIndex,
        isHeadingEnabled
    );
};

/**
 * @param {VFile} file
 * @param {readonly Heading[]} h2Headings
 * @param {readonly string[]} headingNames
 * @param {RegExp} ruleCatalogIdLinePattern
 */
const reportRuleCatalogIdIssues = (
    file,
    h2Headings,
    headingNames,
    ruleCatalogIdLinePattern
) => {
    const furtherReadingIndex = headingNames.indexOf("Further reading");
    const headingNode =
        getH2HeadingNodeAt(h2Headings, furtherReadingIndex) ?? h2Headings[0];
    const ruleCatalogIdLines = String(file)
        .split(/\r?\n/u)
        .map((line) => line.trimEnd())
        .filter((line) => ruleCatalogIdLinePattern.test(line));

    if (ruleCatalogIdLines.length === 0) {
        file.message(
            "Missing required rule catalog marker line `> **Rule catalog ID:** R###`.",
            headingNode,
            "remark-lint:rule-doc-headings:missing-rule-catalog-id"
        );
    }

    if (ruleCatalogIdLines.length > 1) {
        file.message(
            "Rule docs must contain exactly one `> **Rule catalog ID:** R###` marker line.",
            headingNode,
            "remark-lint:rule-doc-headings:duplicate-rule-catalog-id"
        );
    }
};

/**
 * @param {Root} tree
 * @param {VFile} file
 * @param {RuleDocHeadingsConfiguration} configuration
 */
const validateRuleDocHeadings = (tree, file, configuration) => {
    const {
        headingOrderIndex,
        isHeadingEnabled,
        optionalDetailHeadings,
        packageDocumentationLabelPattern,
        requirePackageDocumentation,
        requirePackageDocumentationLabel,
        requireRuleCatalogId,
        requiredCanonicalHeadings,
        ruleCatalogIdLinePattern,
        ruleNamespaceAliases: configuredRuleNamespaceAliases,
    } = configuration;
    const normalizedPath = normalizePath(file.path);
    const h1Headings = getHeadingsByDepth(tree, 1);
    const h2Headings = getHeadingsByDepth(tree, 2);
    const headingNames = h2Headings.map((heading) =>
        getNodeText(heading).trim()
    );
    const expectedRuleTitle = normalizedPath
        .split("/")
        .at(-1)
        ?.replace(/\.md$/u, "");
    const packageMetadata = getNearestPackageMetadata(file.path);
    const packageRuleNamespaceAliases = isPackageName(packageMetadata?.name)
        ? getRuleNamespaceAliasesFromPackageName(packageMetadata.name)
        : [];
    const ruleNamespaceAliases = [
        ...new Set([
            ...packageRuleNamespaceAliases,
            ...configuredRuleNamespaceAliases,
        ]),
    ];

    reportH1HeadingIssues(
        file,
        h1Headings,
        expectedRuleTitle,
        ruleNamespaceAliases
    );
    reportDuplicateHeadingIssues(
        file,
        h2Headings,
        headingNames,
        isHeadingEnabled
    );
    reportDetailHeadingParentIssues(
        tree,
        file,
        optionalDetailHeadings,
        isHeadingEnabled
    );
    reportDetailHeadingOrderIssues(
        tree,
        file,
        optionalDetailHeadings,
        isHeadingEnabled
    );
    reportHeadingOrderIssues(
        file,
        h2Headings,
        headingNames,
        headingOrderIndex,
        isHeadingEnabled
    );
    reportMissingRequiredHeadingIssues(
        file,
        headingNames,
        requiredCanonicalHeadings
    );
    reportLeadingHeadingIssues(
        file,
        h2Headings,
        headingNames,
        isHeadingEnabled
    );
    reportMissingOptionalHeadingIssues(
        file,
        h2Headings,
        headingNames,
        requirePackageDocumentation,
        isHeadingEnabled
    );

    const packageDocumentationIndex = headingNames.indexOf(
        "Package documentation"
    );

    reportDeprecatedSectionIssues(
        file,
        h2Headings,
        headingNames.indexOf("Deprecated"),
        isHeadingEnabled
    );
    reportPackageDocumentationLabelIssues(
        file,
        h2Headings,
        packageDocumentationIndex,
        requirePackageDocumentationLabel,
        packageDocumentationLabelPattern,
        isHeadingEnabled
    );

    if (requireRuleCatalogId) {
        reportRuleCatalogIdIssues(
            file,
            h2Headings,
            headingNames,
            ruleCatalogIdLinePattern
        );
    }
};

/**
 * Enforce canonical helper-doc heading schema.
 *
 * @param {RemarkLintRuleDocHeadingsOptions} [options]
 *
 * @returns {(tree: Node, file: VFile) => void}
 */
export default function remarkLintRuleDocHeadings(options = {}) {
    const headingToggles = {
        ...defaultHeadingToggles,
        ...options.headings,
    };
    const helperDocPathPattern =
        options.helperDocPathPattern ?? defaultHelperDocPathPattern;
    const requirePackageDocumentation =
        options.requirePackageDocumentation ?? false;
    const requirePackageDocumentationLabel =
        options.requirePackageDocumentationLabel ??
        options.packageDocumentationLabelPattern !== undefined;
    const requireRuleCatalogId =
        options.requireRuleCatalogId ??
        options.ruleCatalogIdLinePattern !== undefined;
    const packageDocumentationLabelPattern =
        options.packageDocumentationLabelPattern ??
        defaultPackageDocumentationLabelPattern;
    const ruleCatalogIdLinePattern =
        options.ruleCatalogIdLinePattern ?? defaultRuleCatalogIdLinePattern;
    /** @param {keyof typeof defaultHeadingToggles} headingKey */
    const isHeadingEnabled = (headingKey) =>
        headingToggles[headingKey] !== false;
    const enabledCanonicalHeadingOrder = canonicalHeadingDefinitions
        .filter((definition) => isHeadingEnabled(definition.key))
        .map((definition) => definition.heading);
    const headingOrderIndex = new Map(
        enabledCanonicalHeadingOrder.map((heading, index) => [heading, index])
    );
    const optionalDetailHeadings = new Set(
        optionalDetailHeadingDefinitions
            .filter((definition) => isHeadingEnabled(definition.key))
            .map((definition) => definition.heading)
    );
    const requiredCanonicalHeadings = canonicalHeadingDefinitions.filter(
        (definition) =>
            isHeadingEnabled(definition.key) && definition.requiredByDefault
    );

    return (tree, file) => {
        if (
            typeof file.path !== "string" ||
            !isRootNode(tree) ||
            !helperDocPathPattern.test(normalizePath(file.path))
        ) {
            return;
        }

        validateRuleDocHeadings(tree, file, {
            headingOrderIndex,
            isHeadingEnabled,
            optionalDetailHeadings,
            packageDocumentationLabelPattern,
            requirePackageDocumentation,
            requirePackageDocumentationLabel,
            requireRuleCatalogId,
            requiredCanonicalHeadings,
            ruleCatalogIdLinePattern,
            ruleNamespaceAliases: options.ruleNamespaceAliases ?? [],
        });
    };
}
