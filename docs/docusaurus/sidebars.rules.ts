/**
 * @packageDocumentation
 * Dynamic sidebar generation for plugin rule documentation sections.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

type SidebarDocItem = {
    readonly id: string;
    readonly label: string;
    readonly type: "doc";
};

const sidebarDirectoryPath = dirname(fileURLToPath(import.meta.url));
const rulesDirectoryPath = join(sidebarDirectoryPath, "..", "rules");

const isMarkdownFile = (fileName: string): boolean => fileName.endsWith(".md");

const toRuleDocId = (fileName: string): string => fileName.slice(0, -3);

const allRuleDocIds = readdirSync(rulesDirectoryPath, {
    withFileTypes: true,
})
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => toRuleDocId(entry.name))
    .sort((left, right) => left.localeCompare(right));

const ruleDocIds = allRuleDocIds.filter(
    (ruleDocId) =>
        ruleDocId.startsWith("no-") || ruleDocId.startsWith("require-")
);

const ruleNumberByDocId = new Map<string, number>(
    ruleDocIds.map((ruleDocId, index) => [ruleDocId, index + 1])
);

const toNumberedRuleLabel = (ruleNumber: number, ruleDocId: string): string =>
    `${String(ruleNumber).padStart(2, "0")} ${ruleDocId}`;

const ruleItems: SidebarDocItem[] = ruleDocIds.map((ruleDocId) => {
    const ruleNumber = ruleNumberByDocId.get(ruleDocId);

    if (ruleNumber === undefined) {
        throw new TypeError(
            `Missing stable sidebar rule number for '${ruleDocId}'.`
        );
    }

    return {
        id: ruleDocId,
        label: toNumberedRuleLabel(ruleNumber, ruleDocId),
        type: "doc",
    };
});

const sidebars = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-guides",
            collapsed: true,
            customProps: {
                badge: "guides",
            },
            label: "Adoption",
            link: {
                description:
                    "Rollout guidance for weak-test signal enforcement.",
                title: "Adoption",
                type: "generated-index",
            },
            type: "category",
            items: [
                {
                    id: "guides/adoption-checklist",
                    label: "Adoption checklist",
                    type: "doc",
                },
                {
                    id: "guides/rollout-and-fix-safety",
                    label: "Rollout and fix safety",
                    type: "doc",
                },
                {
                    id: "guides/preset-selection-strategy",
                    label: "Preset selection strategy",
                    type: "doc",
                },
                {
                    id: "guides/rule-coverage-gap-analysis",
                    label: "Rule coverage gaps",
                    type: "doc",
                },
                {
                    id: "guides/type-aware-linting-readiness",
                    label: "Type-aware linting readiness",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-presets",
            collapsed: true,
            customProps: {
                badge: "presets",
            },
            label: "Presets",
            link: {
                id: "presets/index",
                type: "doc",
            },
            type: "category",
            items: [
                {
                    id: "presets/minimal",
                    label: "Minimal",
                    type: "doc",
                },
                {
                    id: "presets/recommended",
                    label: "Recommended",
                    type: "doc",
                },
                {
                    id: "presets/recommended-type-checked",
                    label: "Recommended Type Checked",
                    type: "doc",
                },
                {
                    id: "presets/strict",
                    label: "Strict",
                    type: "doc",
                },
                {
                    id: "presets/all",
                    label: "All",
                    type: "doc",
                },
                {
                    id: "presets/experimental",
                    label: "Experimental",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-rules",
            collapsed: true,
            customProps: {
                badge: "rules",
            },
            label: "Rules",
            link: {
                description:
                    "Rule documentation for every eslint-plugin-test-signal rule.",
                slug: "/",
                title: "Rule Reference",
                type: "generated-index",
            },
            type: "category",
            items: ruleItems,
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
