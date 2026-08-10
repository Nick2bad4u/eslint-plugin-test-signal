import { describe, expect, it } from "vitest";

import { isIgnoredDirectoryName } from "../scripts/check-doc-links.mjs";

describe("documentation link-check boundaries", () => {
    it("excludes generated and temporary directories", () => {
        expect.hasAssertions();
        expect(isIgnoredDirectoryName("node_modules")).toBe(true);
        expect(isIgnoredDirectoryName("dist")).toBe(true);
        expect(isIgnoredDirectoryName("temp")).toBe(true);
    });

    it("keeps source documentation directories in scope", () => {
        expect.hasAssertions();
        expect(isIgnoredDirectoryName("docs")).toBe(false);
        expect(isIgnoredDirectoryName("site-docs")).toBe(false);
    });
});
