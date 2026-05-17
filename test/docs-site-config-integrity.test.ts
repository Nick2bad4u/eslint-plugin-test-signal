import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const readWorkspaceFile = (relativePath: string): string =>
    fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

const siteDocsDirectory = path.join(process.cwd(), "docs/docusaurus/site-docs");
const generatedTypedocDocIdPattern = /^developer\/api(?:\/|$)/v;

const getExistingDocPath = (docId: string): string | undefined => {
    const exactMarkdownPath = path.join(siteDocsDirectory, `${docId}.md`);

    if (fs.existsSync(exactMarkdownPath)) {
        return exactMarkdownPath;
    }

    const indexMarkdownPath = path.join(siteDocsDirectory, docId, "index.md");

    if (fs.existsSync(indexMarkdownPath)) {
        return indexMarkdownPath;
    }

    const docDirectoryPath = path.dirname(path.join(siteDocsDirectory, docId));
    const docBaseName = path.basename(docId);

    if (!fs.existsSync(docDirectoryPath)) {
        return undefined;
    }

    return fs
        .readdirSync(docDirectoryPath)
        .find(
            (entryName) =>
                /^\d+-/v.test(entryName) &&
                entryName.endsWith(`${docBaseName}.md`)
        );
};

describe("docusaurus site configuration integrity", () => {
    it("uses canonical blob editUrl bases for rules/docs/blog/pages", () => {
        expect.hasAssertions();

        const docusaurusConfigSource = readWorkspaceFile(
            "docs/docusaurus/docusaurus.config.ts"
        );

        expect(docusaurusConfigSource).toMatch(
            /editUrl:\s*`https:\/\/github\.com\/\$\{organizationName\}\/\$\{projectName\}\/blob\/main\/docs\/`/v
        );

        expect(docusaurusConfigSource).toMatch(
            /editUrl:\s*`https:\/\/github\.com\/\$\{organizationName\}\/\$\{projectName\}\/blob\/main\/docs\/docusaurus\/`/v
        );

        expect(docusaurusConfigSource).not.toContain("/tree/");
        expect(docusaurusConfigSource).not.toContain("/blog/blog/");
    });

    it("developer sidebar points at existing local docs", () => {
        expect.hasAssertions();

        const sidebarSource = readWorkspaceFile("docs/docusaurus/sidebars.ts");
        const developerDocIds = [
            ...sidebarSource.matchAll(/id:\s*"(?<docId>developer\/[^"]+)"/gv),
        ].map((match) => match.groups?.["docId"]);

        expect(developerDocIds.length).toBeGreaterThan(0);

        for (const developerDocId of developerDocIds) {
            expect(developerDocId).toBeDefined();

            if (developerDocId === undefined) {
                continue;
            }

            if (generatedTypedocDocIdPattern.test(developerDocId)) {
                continue;
            }

            expect(getExistingDocPath(developerDocId)).toBeDefined();
        }
    });
});
