/**
 * @packageDocumentation
 * Main Docusaurus sidebar configuration.
 */
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const packageName = "eslint-plugin-test-signal";

const sidebars = {
    docs: [
        {
            id: "intro",
            label: packageName,
            type: "doc",
        },
        {
            id: "getting-started",
            label: "Getting Started",
            type: "doc",
        },
        {
            collapsed: true,
            label: "Developer",
            link: {
                id: "developer/index",
                type: "doc",
            },
            type: "category",
            items: [
                {
                    id: "developer/index",
                    label: "Development Guide",
                    type: "doc",
                },
                {
                    id: "developer/api/index",
                    label: "API Reference",
                    type: "doc",
                },
            ],
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
