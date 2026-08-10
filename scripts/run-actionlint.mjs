import { createLinter } from "actionlint";
import { readdir, readFile } from "node:fs/promises";
import { join, posix } from "node:path";

const workflowsDirectory = join(process.cwd(), ".github", "workflows");
const workflowNames = (await readdir(workflowsDirectory))
    .filter((name) => /\.(?:yaml|yml)$/v.test(name))
    .toSorted();
const findings = [];

for (const workflowName of workflowNames) {
    const workflowPath = join(workflowsDirectory, workflowName);
    const displayPath = posix.join(".github", "workflows", workflowName);
    const source = await readFile(workflowPath, "utf8");
    const lint = await createLinter();

    findings.push(...lint(source, displayPath));
}

for (const finding of findings) {
    console.error(
        `${finding.file}:${finding.line}:${finding.column}: ${finding.kind}: ${finding.message}`
    );
}

if (findings.length > 0) {
    process.exitCode = 1;
} else {
    console.log(`Actionlint passed for ${workflowNames.length} workflows.`);
}
