import { describe, expect, it } from "vitest";

import { resolveNpmPackFilename } from "../scripts/resolve-npm-pack-filename.mjs";

describe("npm pack metadata", () => {
    it("supports the npm 11 array shape", () => {
        expect.hasAssertions();
        expect(
            resolveNpmPackFilename([
                { filename: "eslint-plugin-test-signal-1.2.13.tgz" },
            ])
        ).toBe("eslint-plugin-test-signal-1.2.13.tgz");
    });

    it("supports the npm 12 package-name-keyed object shape", () => {
        expect.hasAssertions();
        expect(
            resolveNpmPackFilename({
                "eslint-plugin-test-signal": {
                    filename: "eslint-plugin-test-signal-1.2.13.tgz",
                },
            })
        ).toBe("eslint-plugin-test-signal-1.2.13.tgz");
    });

    it.each([
        ["a primitive root", "invalid"],
        ["no package records", []],
        [
            "multiple package records",
            [{ filename: "first.tgz" }, { filename: "second.tgz" }],
        ],
        ["a primitive package record", ["invalid"]],
        ["a missing filename", [{}]],
        ["a blank filename", [{ filename: " ".repeat(3) }]],
        ["a non-tarball filename", [{ filename: "package.zip" }]],
        ["a POSIX path", [{ filename: "assets/package.tgz" }]],
        ["a Windows path", [{ filename: String.raw`assets\package.tgz` }]],
    ])("rejects %s", (_description, metadata) => {
        expect.hasAssertions();
        expect(() => resolveNpmPackFilename(metadata)).toThrow(/./v);
    });
});
