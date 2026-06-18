/**
 * @packageDocumentation
 * Main Docusaurus sidebar configuration.
 */
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const packageName = "eslint-plugin-test-signal";
const repositoryUrl = "https://github.com/Nick2bad4u/eslint-plugin-test-signal";

const sidebars = {
    docs: [
        {
            className: "sb-doc-overview",
            id: "intro",
            label: packageName,
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-developer",
            collapsed: true,
            items: [
                {
                    id: "developer/index",
                    label: "Development Guide",
                    type: "doc",
                },
                {
                    className: "sb-cat-api-overview",
                    collapsed: true,
                    items: [
                        {
                            id: "developer/api/plugin/index",
                            label: "Plugin API",
                            type: "doc",
                        },
                        {
                            id: "developer/api/internal/test-ast/index",
                            label: "Test AST Helpers",
                            type: "doc",
                        },
                        {
                            id: "developer/api/internal/rule-catalog/index",
                            label: "Rule Catalog",
                            type: "doc",
                        },
                        {
                            id: "developer/api/internal/typed-rule/index",
                            label: "Typed Rule Factory",
                            type: "doc",
                        },
                    ],
                    label: "API Reference",
                    link: {
                        id: "developer/api/index",
                        type: "doc",
                    },
                    type: "category",
                },
                {
                    className: "sb-cat-developer-adr",
                    collapsed: true,
                    items: [
                        {
                            id: "developer/adr/rule-catalog-and-static-doc-metadata",
                            label: "Rule catalog and docs metadata",
                            type: "doc",
                        },
                        {
                            id: "developer/adr/weak-test-signal-heuristics",
                            label: "Weak test signal heuristics",
                            type: "doc",
                        },
                    ],
                    label: "ADRs",
                    link: {
                        description:
                            "Architecture decisions for the test-signal rule catalog and weak-test heuristics.",
                        title: "Architecture Decision Records",
                        type: "generated-index",
                    },
                    type: "category",
                },
                {
                    className: "sb-cat-dev-charts",
                    collapsed: true,
                    items: [
                        {
                            id: "developer/charts/rule-signal-map",
                            label: "Rule signal map",
                            type: "doc",
                        },
                        {
                            id: "developer/charts/validation-pipeline",
                            label: "Validation pipeline",
                            type: "doc",
                        },
                    ],
                    label: "Charts",
                    link: {
                        description:
                            "Visual maps for rule coverage and release validation flows.",
                        title: "Developer Charts",
                        type: "generated-index",
                    },
                    type: "category",
                },
                {
                    className: "sb-cat-dev-links",
                    collapsed: true,
                    items: [
                        {
                            href: repositoryUrl,
                            label: "GitHub Repository",
                            type: "link",
                        },
                        {
                            href: `${repositoryUrl}/issues`,
                            label: "Issues",
                            type: "link",
                        },
                        {
                            href: `${repositoryUrl}/actions`,
                            label: "Actions",
                            type: "link",
                        },
                        {
                            href: "https://www.npmjs.com/package/eslint-plugin-test-signal",
                            label: "npm Package",
                            type: "link",
                        },
                        {
                            href: "https://nick2bad4u.github.io/eslint-plugin-test-signal/eslint-inspector/",
                            label: "ESLint Inspector",
                            type: "link",
                        },
                    ],
                    label: "Project Links",
                    type: "category",
                },
            ],
            label: "Developer",
            link: {
                id: "developer/index",
                type: "doc",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
