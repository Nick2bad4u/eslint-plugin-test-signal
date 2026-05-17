/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-test-signal RuleTester suites.
 */
import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "node:path";
import pc from "picocolors";
import { afterAll, describe, it } from "vitest";

import testSignalPlugin from "../../src/plugin";

type UnknownArray = readonly unknown[];
type UnknownRecord = Record<string, unknown>;

/** Shared timeout applied to RuleTester-generated Vitest cases. */
const ruleTesterCaseTimeoutMilliseconds = 120_000;
/** Stable Vitest options object used for every RuleTester case wrapper. */
const ruleTesterCaseTimeoutOptions = Object.freeze({
    timeout: ruleTesterCaseTimeoutMilliseconds,
});

const assertRuleTesterHook: (
    candidate: unknown,
    hookName: string
) => asserts candidate is (...arguments_: UnknownArray) => unknown = (
    candidate,
    hookName
) => {
    if (typeof candidate !== "function") {
        throw new TypeError(
            `Expected Vitest hook '${hookName}' to be a function for RuleTester wiring.`
        );
    }
};

type RuleTesterCaseCallback = Parameters<typeof RuleTester.it>[1];
type TimedVitestTestHook = (
    text: string,
    options: Readonly<{ timeout: number }>,
    callback: RuleTesterCaseCallback
) => unknown;

const runTimedRuleTesterCase = ({
    callback,
    hook,
    hookName,
    text,
}: Readonly<{
    callback: RuleTesterCaseCallback;
    hook: unknown;
    hookName: string;
    text: string;
}>): void => {
    assertRuleTesterHook(hook, hookName);
    Reflect.apply(hook as TimedVitestTestHook, undefined, [
        text,
        ruleTesterCaseTimeoutOptions,
        callback,
    ]);
};

assertRuleTesterHook(afterAll, "afterAll");
RuleTester.afterAll = (...arguments_: UnknownArray) => {
    Reflect.apply(afterAll as (...args: UnknownArray) => unknown, undefined, [
        ...arguments_,
    ]);
};
assertRuleTesterHook(describe, "describe");
RuleTester.describe = (...arguments_: UnknownArray) => {
    Reflect.apply(describe as (...args: UnknownArray) => unknown, undefined, [
        ...arguments_,
    ]);
};
assertRuleTesterHook(it, "it");
RuleTester.it = (text, callback) => {
    runTimedRuleTesterCase({
        callback,
        hook: it,
        hookName: "it",
        text,
    });
};
const vitestItOnly: unknown = Reflect.get(it, "only");
assertRuleTesterHook(vitestItOnly, "it.only");
RuleTester.itOnly = (text, callback) => {
    runTimedRuleTesterCase({
        callback,
        hook: vitestItOnly,
        hookName: "it.only",
        text,
    });
};

type PluginRuleModule = Parameters<RuleTester["run"]>[1];
type RuleRunArguments = Parameters<RuleTester["run"]>;
type RuleRunCases = RuleRunArguments[2];
type RuleRunInvalidCase = RuleRunCases["invalid"][number];
type RuleRunValidCase = RuleRunCases["valid"][number];

const deriveGeneratedCaseName = (
    ruleName: string,
    caseKind: "invalid" | "valid",
    caseIndex: number,
    caseFilename?: string
): string => {
    const caseLabel = [
        pc.bold(pc.magentaBright("UNNAMED")),
        caseKind === "invalid"
            ? pc.bold(pc.red("invalid"))
            : pc.bold(pc.green("valid")),
        pc.underline(pc.yellow(`#${String(caseIndex + 1)}`)),
    ].join(" ");
    const caseSource =
        typeof caseFilename === "string" && caseFilename.length > 0
            ? pc.underline(pc.cyan(path.basename(caseFilename)))
            : pc.underline(pc.blue(ruleName));

    return `${caseSource}${pc.dim(" - ")}${caseLabel}`;
};

const withGeneratedRuleCaseNames = (
    ruleName: string,
    runCases: Readonly<RuleRunCases>
): RuleRunCases => {
    const normalizedInvalidCases: RuleRunCases["invalid"] =
        runCases.invalid.map(
            (entry: Readonly<RuleRunInvalidCase>, caseIndex) =>
                typeof entry.name === "string" && entry.name.length > 0
                    ? {
                          ...entry,
                          name: pc.bold(pc.cyanBright(entry.name)),
                      }
                    : {
                          ...entry,
                          name: deriveGeneratedCaseName(
                              ruleName,
                              "invalid",
                              caseIndex,
                              entry.filename
                          ),
                      }
        );

    const normalizedValidCases: RuleRunCases["valid"] = runCases.valid.map(
        (entry: Readonly<RuleRunValidCase>, caseIndex) => {
            if (typeof entry === "string") {
                return {
                    code: entry,
                    name: deriveGeneratedCaseName(ruleName, "valid", caseIndex),
                };
            }

            if (typeof entry.name === "string" && entry.name.length > 0) {
                return {
                    ...entry,
                    name: pc.bold(pc.cyanBright(entry.name)),
                };
            }

            return {
                ...entry,
                name: deriveGeneratedCaseName(
                    ruleName,
                    "valid",
                    caseIndex,
                    entry.filename
                ),
            };
        }
    );

    return {
        invalid: normalizedInvalidCases,
        valid: normalizedValidCases,
    };
};

const patchRuleTesterRunWithGeneratedCaseNames = <
    TRuleTester extends RuleTester,
>(
    tester: TRuleTester
): TRuleTester => {
    const originalRun = tester.run.bind(tester);
    tester.run = (ruleName, ruleModule, runCases) => {
        (originalRun as (...args: UnknownArray) => void)(
            ruleName,
            ruleModule,
            withGeneratedRuleCaseNames(ruleName, runCases)
        );
    };
    return tester;
};

export const applySharedRuleTesterRunBehavior = <TRuleTester extends RuleTester>(
    tester: TRuleTester
): TRuleTester => patchRuleTesterRunWithGeneratedCaseNames(tester);

export const repoPath = (...segments: readonly string[]): string =>
    path.join(process.cwd(), ...segments);

export const createRuleTester = (): RuleTester =>
    applySharedRuleTesterRunBehavior(
        new RuleTester({
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    sourceType: "module",
                },
            },
        })
    );

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const isRuleModule = (value: unknown): value is PluginRuleModule => {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value["create"] === "function";
};

export const getPluginRule = (ruleId: string): PluginRuleModule => {
    const dynamicRules = testSignalPlugin.rules as UnknownRecord;

    if (!Object.hasOwn(dynamicRules, ruleId)) {
        throw new Error(
            `Rule '${ruleId}' is not registered in testSignalPlugin`
        );
    }

    const rule = dynamicRules[ruleId];

    if (!isRuleModule(rule)) {
        throw new Error(`Rule '${ruleId}' is not a valid ESLint rule module`);
    }

    return rule;
};
