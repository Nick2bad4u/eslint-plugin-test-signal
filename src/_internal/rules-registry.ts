/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-test-signal.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import type { TestSignalRuleNamePattern } from "./rule-catalog.js";

import noAssertionsInHooksRule from "../rules/no-assertions-in-hooks.js";
import noAsyncForeachAssertionsRule from "../rules/no-async-foreach-assertions.js";
import noConditionalAssertionsRule from "../rules/no-conditional-assertions.js";
import noDisabledTestsRule from "../rules/no-disabled-tests.js";
import noEmptyAsyncTestsRule from "../rules/no-empty-async-tests.js";
import noFocusedTestsRule from "../rules/no-focused-tests.js";
import noMockCallOnlyTestsRule from "../rules/no-mock-call-only-tests.js";
import noSnapshotOnlyTestsRule from "../rules/no-snapshot-only-tests.js";
import noTryCatchAssertionsRule from "../rules/no-try-catch-assertions.js";
import noWeakTruthyAssertionsRule from "../rules/no-weak-truthy-assertions.js";
import requireAssertionsRule from "../rules/require-assertions.js";
import requireAwaitedAsyncAssertionsRule from "../rules/require-awaited-async-assertions.js";
import requireErrorMessageAssertionsRule from "../rules/require-error-message-assertions.js";
import requireNegativePathRule from "../rules/require-negative-path.js";

/** Runtime rule module shape used by registry/preset builders. */
export type RuleWithDocs = TSESLint.RuleModule<string>;

/**
 * Runtime map of all rule modules keyed by unqualified rule name.
 */
const testSignalRuleRegistry: Readonly<
    Record<TestSignalRuleNamePattern, RuleWithDocs>
> = {
    "no-assertions-in-hooks": noAssertionsInHooksRule,
    "no-async-foreach-assertions": noAsyncForeachAssertionsRule,
    "no-conditional-assertions": noConditionalAssertionsRule,
    "no-disabled-tests": noDisabledTestsRule,
    "no-empty-async-tests": noEmptyAsyncTestsRule,
    "no-focused-tests": noFocusedTestsRule,
    "no-mock-call-only-tests": noMockCallOnlyTestsRule,
    "no-snapshot-only-tests": noSnapshotOnlyTestsRule,
    "no-try-catch-assertions": noTryCatchAssertionsRule,
    "no-weak-truthy-assertions": noWeakTruthyAssertionsRule,
    "require-assertions": requireAssertionsRule,
    "require-awaited-async-assertions": requireAwaitedAsyncAssertionsRule,
    "require-error-message-assertions": requireErrorMessageAssertionsRule,
    "require-negative-path": requireNegativePathRule,
};

/** Exported typed view consumed by the plugin entrypoint. */
export const testSignalRules: Readonly<
    Record<TestSignalRuleNamePattern, RuleWithDocs>
> = testSignalRuleRegistry;

export default testSignalRules;
