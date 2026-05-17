import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const readWorkspaceFile = (relativePath: string): string =>
    fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

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

            const resolvedTargetPath = path.resolve(
                process.cwd(),
                "docs/docusaurus/site-docs",
                `${developerDocId}.md`
            );

            expect(fs.existsSync(resolvedTargetPath)).toBeTruthy();
        }
    });
});
