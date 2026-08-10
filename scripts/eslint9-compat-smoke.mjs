/**
 * Smoke-test the published plugin build against ESLint 9 in an isolated temp
 * workspace.
 */
// @ts-check

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));

const isolatedNpmConfigNames = new Set([
    "npm_config_allow_scripts",
    "npm_config_globalconfig",
    "npm_config_strict_allow_scripts",
    "npm_config_userconfig",
]);

export const createIsolatedNpmEnvironment = (
    baseEnvironment,
    userConfigPath,
    globalConfigPath
) => ({
    ...Object.fromEntries(
        Object.entries(baseEnvironment).filter(
            ([name]) => !isolatedNpmConfigNames.has(name.toLowerCase())
        )
    ),
    NPM_CONFIG_GLOBALCONFIG: globalConfigPath,
    NPM_CONFIG_USERCONFIG: userConfigPath,
});

/**
 * Resolve the requested ESLint 9 dependency specifier.
 *
 * @param {readonly string[]} argumentList - CLI arguments.
 * @param {string | undefined} environmentVersion - Optional CI override.
 *
 * @returns {string} An exact or caret ESLint 9 version.
 */
const resolveEslintVersion = (argumentList, environmentVersion) => {
    let eslintVersion = environmentVersion?.trim() || "^9.39.1";

    for (let index = 0; index < argumentList.length; index += 1) {
        const argument = argumentList[index] ?? "";

        if (argument === "--eslint-version") {
            const nextArgument = argumentList[index + 1];

            if (typeof nextArgument !== "string") {
                throw new TypeError(
                    "Expected a version after --eslint-version."
                );
            }

            eslintVersion = nextArgument;
            index += 1;
            continue;
        }

        if (argument.startsWith("--eslint-version=")) {
            eslintVersion = argument.slice("--eslint-version=".length);
            continue;
        }

        throw new TypeError(`Unknown argument: ${argument}`);
    }

    if (!/^\^?9\.\d+\.\d+$/v.test(eslintVersion)) {
        throw new TypeError(
            `Expected an exact or caret ESLint 9 version, received: ${eslintVersion}`
        );
    }

    return eslintVersion;
};

/**
 * Run a command in a child process.
 *
 * @param {string} command - Command executable.
 * @param {readonly string[]} args - Command arguments.
 * @param {string} cwd - Working directory.
 * @param {NodeJS.ProcessEnv} environment - Isolated child environment.
 *
 * @returns {Promise<void>} Resolves when the command exits successfully.
 */
const run = async (command, args, cwd, environment) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            env: environment,
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

/**
 * Run the active npm CLI without invoking a command shell.
 *
 * @param {string} npmCliPath - Path to the active npm CLI module.
 * @param {readonly string[]} args - Npm CLI arguments.
 * @param {string} cwd - Working directory.
 * @param {NodeJS.ProcessEnv} environment - Isolated child environment.
 *
 * @returns {Promise<void>} Resolves when npm exits successfully.
 */
const runNpm = (npmCliPath, args, cwd, environment) =>
    run(process.execPath, [npmCliPath, ...args], cwd, environment);

const main = async () => {
    const npmCliPath = process.env["npm_execpath"];
    if (typeof npmCliPath !== "string" || npmCliPath.trim() === "") {
        throw new TypeError(
            "Expected npm_execpath. Run this smoke test through its npm package script."
        );
    }

    const eslintVersion = resolveEslintVersion(
        process.argv.slice(2),
        process.env["TEST_SIGNAL_ESLINT_VERSION"]
    );
    const tempWorkspace = await mkdtemp(join(tmpdir(), "test-signal-eslint9-"));

    try {
        const npmUserConfigPath = join(tempWorkspace, "npm-userconfig");
        const npmGlobalConfigPath = join(tempWorkspace, "npm-globalconfig");
        const npmEnvironment = createIsolatedNpmEnvironment(
            process.env,
            npmUserConfigPath,
            npmGlobalConfigPath
        );

        await Promise.all([
            writeFile(npmUserConfigPath, ""),
            writeFile(npmGlobalConfigPath, ""),
            writeFile(
                join(tempWorkspace, "package.json"),
                JSON.stringify(
                    {
                        private: true,
                        type: "module",
                        devDependencies: {
                            eslint: eslintVersion,
                            "eslint-plugin-test-signal": `file:${workspaceRoot}`,
                            typescript: "^6.0.3",
                        },
                    },
                    null,
                    2
                )
            ),
            writeFile(
                join(tempWorkspace, "eslint.config.mjs"),
                [
                    'import testSignal from "eslint-plugin-test-signal";',
                    "",
                    "export default [testSignal.configs.recommended];",
                    "",
                ].join("\n")
            ),
            writeFile(
                join(tempWorkspace, "sample.test.ts"),
                [
                    'it("renders", () => {',
                    "    const panel = renderPanel();",
                    '    expect(panel.role).toBe("alert");',
                    "    expect(panel).toMatchSnapshot();",
                    "});",
                    "",
                ].join("\n")
            ),
        ]);

        await runNpm(
            npmCliPath,
            [
                "install",
                "--ignore-scripts",
                "--no-audit",
                "--no-fund",
            ],
            tempWorkspace,
            npmEnvironment
        );
        await runNpm(
            npmCliPath,
            [
                "exec",
                "--offline",
                "--ignore-scripts",
                "--",
                "eslint",
                "--version",
            ],
            tempWorkspace,
            npmEnvironment
        );
        await runNpm(
            npmCliPath,
            [
                "exec",
                "--offline",
                "--ignore-scripts",
                "--",
                "eslint",
                "sample.test.ts",
            ],
            tempWorkspace,
            npmEnvironment
        );
    } finally {
        await rm(tempWorkspace, {
            force: true,
            recursive: true,
        });
    }
};

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await main();
}
