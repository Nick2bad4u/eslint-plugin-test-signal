import { readFile } from "node:fs/promises";
import { posix, win32 } from "node:path";
import { pathToFileURL } from "node:url";

const isRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const extractPackRecords = (metadata) => {
    if (Array.isArray(metadata)) {
        return metadata;
    }

    if (isRecord(metadata)) {
        return Object.values(metadata);
    }

    throw new TypeError(
        "npm pack metadata must be an array or a package-name-keyed object."
    );
};

export const resolveNpmPackFilename = (metadata) => {
    const records = extractPackRecords(metadata);

    if (records.length !== 1) {
        throw new Error(
            `Expected exactly one npm pack record, but received ${records.length}.`
        );
    }

    const record = records[0];
    if (!isRecord(record)) {
        throw new TypeError("The npm pack record must be an object.");
    }

    const { filename } = record;
    if (
        typeof filename !== "string" ||
        filename.length === 0 ||
        filename !== filename.trim()
    ) {
        throw new TypeError(
            "The npm pack record must contain a nonblank filename."
        );
    }

    if (
        !filename.endsWith(".tgz") ||
        posix.basename(filename) !== filename ||
        win32.basename(filename) !== filename
    ) {
        throw new Error(
            "The npm pack filename must be a path-free .tgz filename."
        );
    }

    return filename;
};

const runCli = async () => {
    const metadataPath = process.argv[2];
    if (typeof metadataPath !== "string" || process.argv.length !== 3) {
        throw new Error(
            "Usage: node scripts/resolve-npm-pack-filename.mjs <metadata-path>"
        );
    }

    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    process.stdout.write(resolveNpmPackFilename(metadata));
};

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    try {
        await runCli();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Unable to resolve the npm pack filename: ${message}`);
        process.exitCode = 1;
    }
}
