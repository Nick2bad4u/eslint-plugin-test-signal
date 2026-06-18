import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * @packageDocumentation
 * Dynamic sidebar generation for plugin rule documentation sections.
 */
import { readdirSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

interface SidebarDocItem {
    readonly className?: string;
    readonly id: string;
    readonly label: string;
    readonly type: "doc";
}

const sidebarDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const rulesDirectoryPath = path.join(sidebarDirectoryPath, "..", "rules");

const isMarkdownFile = (fileName: string): boolean => fileName.endsWith(".md");

const toRuleDocId = (fileName: string): string => fileName.slice(0, -3);

const allRuleDocIds = readdirSync(rulesDirectoryPath, {
    withFileTypes: true,
})
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => toRuleDocId(entry.name))
    .toSorted((left, right) => left.localeCompare(right));

const ruleDocIds = allRuleDocIds.filter(
    (ruleDocId) =>
        ruleDocId.startsWith("no-") || ruleDocId.startsWith("require-")
);

const ruleItems: SidebarDocItem[] = ruleDocIds.map((ruleDocId) => ({
    id: ruleDocId,
    label: ruleDocId,
    type: "doc",
}));

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
            label: "Adoption",
            link: {
                description:
                    "Rollout guidance for weak-test signal enforcement.",
                title: "Adoption",
                type: "generated-index",
            },
            type: "category",
        },
        {
            className: "sb-cat-presets",
            collapsed: true,
            customProps: {
                badge: "presets",
            },
            items: [
                {
                    className: "sb-preset-minimal",
                    id: "presets/minimal",
                    label: "Minimal",
                    type: "doc",
                },
                {
                    className: "sb-preset-recommended",
                    id: "presets/recommended",
                    label: "Recommended",
                    type: "doc",
                },
                {
                    className: "sb-preset-recommended-type-checked",
                    id: "presets/recommended-type-checked",
                    label: "Recommended Type Checked",
                    type: "doc",
                },
                {
                    className: "sb-preset-strict",
                    id: "presets/strict",
                    label: "Strict",
                    type: "doc",
                },
                {
                    className: "sb-preset-all",
                    id: "presets/all",
                    label: "All",
                    type: "doc",
                },
                {
                    className: "sb-preset-experimental",
                    id: "presets/experimental",
                    label: "Experimental",
                    type: "doc",
                },
            ],
            label: "Presets",
            link: {
                id: "presets/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-rules",
            collapsed: true,
            customProps: {
                badge: "rules",
            },
            items: ruleItems,
            label: "Rules",
            link: {
                description:
                    "Rule documentation for every eslint-plugin-test-signal rule.",
                slug: "/",
                title: "Rule Reference",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
