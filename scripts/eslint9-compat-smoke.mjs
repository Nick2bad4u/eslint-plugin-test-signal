/**
 * Smoke-test the published plugin build against ESLint 9 in an isolated temp
 * workspace.
 */
// @ts-check

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));

/**
 * Run a command in a child process.
 *
 * @param {string} command - Command executable.
 * @param {readonly string[]} args - Command arguments.
 * @param {string} cwd - Working directory.
 *
 * @returns {Promise<void>} Resolves when the command exits successfully.
 */
const run = async (command, args, cwd) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            shell: process.platform === "win32",
            stdio: "inherit",
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve(undefined);
                return;
            }

            reject(
                new Error(
                    `${command} ${args.join(" ")} failed with exit code ${String(code)}`
                )
            );
        });
    });

const tempWorkspace = await mkdtemp(join(tmpdir(), "test-signal-eslint9-"));

try {
    await writeFile(
        join(tempWorkspace, "package.json"),
        JSON.stringify(
            {
                private: true,
                type: "module",
                devDependencies: {
                    "@typescript-eslint/parser": "^8.59.3",
                    eslint: "^9.0.0",
                    "eslint-plugin-test-signal": `file:${workspaceRoot}`,
                    typescript: "^6.0.3",
                },
            },
            null,
            2
        )
    );
    await writeFile(
        join(tempWorkspace, "eslint.config.mjs"),
        [
            'import testSignal from "eslint-plugin-test-signal";',
            "",
            "export default [testSignal.configs.recommended];",
            "",
        ].join("\n")
    );
    await writeFile(
        join(tempWorkspace, "sample.test.ts"),
        [
            'it("renders", () => {',
            "    const panel = renderPanel();",
            '    expect(panel.role).toBe("alert");',
            "    expect(panel).toMatchSnapshot();",
            "});",
            "",
        ].join("\n")
    );

    await run("npm", ["install", "--force"], tempWorkspace);
    await run("npx", ["eslint", "sample.test.ts"], tempWorkspace);
} finally {
    await rm(tempWorkspace, {
        force: true,
        recursive: true,
    });
}
