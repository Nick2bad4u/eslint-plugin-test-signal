/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-test-signal.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import type { TestSignalRuleNamePattern } from "./rule-catalog.js";

import noAssertionsInHooksRule from "../rules/no-assertions-in-hooks.js";
import noAsyncForeachAssertionsRule from "../rules/no-async-foreach-assertions.js";
import noBroadObjectKeyCountAssertionsRule from "../rules/no-broad-object-key-count-assertions.js";
import noConditionalAssertionsRule from "../rules/no-conditional-assertions.js";
import noConstantAssertionsRule from "../rules/no-constant-assertions.js";
import noDisabledTestsRule from "../rules/no-disabled-tests.js";
import noDuplicateAssertionsRule from "../rules/no-duplicate-assertions.js";
import noEmptyAsyncTestsRule from "../rules/no-empty-async-tests.js";
import noFixedDelayTestsRule from "../rules/no-fixed-delay-tests.js";
import noFocusedTestsRule from "../rules/no-focused-tests.js";
import noIdenticalExpectedActualRule from "../rules/no-identical-expected-actual.js";
import noMockCallOnlyTestsRule from "../rules/no-mock-call-only-tests.js";
import noSnapshotOnlyTestsRule from "../rules/no-snapshot-only-tests.js";
import noSyntheticPromiseAssertionsRule from "../rules/no-synthetic-promise-assertions.js";
import noTautologicalLengthAssertionsRule from "../rules/no-tautological-length-assertions.js";
import noTryCatchAssertionsRule from "../rules/no-try-catch-assertions.js";
import noVacuousNumericAssertionsRule from "../rules/no-vacuous-numeric-assertions.js";
import noVacuousStringAssertionsRule from "../rules/no-vacuous-string-assertions.js";
import noWeakAsymmetricAssertionsRule from "../rules/no-weak-asymmetric-assertions.js";
import noWeakExistenceAssertionsRule from "../rules/no-weak-existence-assertions.js";
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
    "no-broad-object-key-count-assertions": noBroadObjectKeyCountAssertionsRule,
    "no-conditional-assertions": noConditionalAssertionsRule,
    "no-constant-assertions": noConstantAssertionsRule,
    "no-disabled-tests": noDisabledTestsRule,
    "no-duplicate-assertions": noDuplicateAssertionsRule,
    "no-empty-async-tests": noEmptyAsyncTestsRule,
    "no-fixed-delay-tests": noFixedDelayTestsRule,
    "no-focused-tests": noFocusedTestsRule,
    "no-identical-expected-actual": noIdenticalExpectedActualRule,
    "no-mock-call-only-tests": noMockCallOnlyTestsRule,
    "no-snapshot-only-tests": noSnapshotOnlyTestsRule,
    "no-synthetic-promise-assertions": noSyntheticPromiseAssertionsRule,
    "no-tautological-length-assertions": noTautologicalLengthAssertionsRule,
    "no-try-catch-assertions": noTryCatchAssertionsRule,
    "no-vacuous-numeric-assertions": noVacuousNumericAssertionsRule,
    "no-vacuous-string-assertions": noVacuousStringAssertionsRule,
    "no-weak-asymmetric-assertions": noWeakAsymmetricAssertionsRule,
    "no-weak-existence-assertions": noWeakExistenceAssertionsRule,
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
