/**
 * @packageDocumentation
 * Type-level contract tests for public plugin exports.
 */
import type {
    TestSignalConfigName,
    TestSignalPlugin,
    TestSignalRuleId,
    TestSignalRuleName,
} from "eslint-plugin-test-signal";

import { assertType } from "vitest";

const validConfigName = "recommended-type-checked";

assertType<TestSignalConfigName>(validConfigName);
// @ts-expect-error Invalid preset key must not satisfy TestSignalConfigName.
assertType<TestSignalConfigName>("recommendedTypeChecked");

const validRuleId = "test-signal/no-empty-async-tests";

assertType<TestSignalRuleId>(validRuleId);
// @ts-expect-error Rule ids must include the `test-signal/` namespace prefix.
assertType<TestSignalRuleId>("no-empty-async-tests");

type RuleNameFromRuleId =
    TestSignalRuleId extends `test-signal/${infer RuleName}` ? RuleName : never;

declare const pluginContract: TestSignalPlugin;

assertType<TestSignalRuleName>(
    "no-empty-async-tests" satisfies RuleNameFromRuleId
);
assertType(pluginContract.configs.recommended);
assertType(pluginContract.configs.all);
assertType(pluginContract.configs.experimental);
assertType(pluginContract.configs);
assertType(pluginContract.meta.name);
assertType(pluginContract.meta.namespace);
