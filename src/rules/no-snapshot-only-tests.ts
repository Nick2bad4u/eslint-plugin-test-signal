/**
 * @packageDocumentation
 * Rule that reports tests whose only assertions are snapshots.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { getTestCall, summarizeAssertions } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "snapshotOnlyTest";

/** Rule module for `test-signal/no-snapshot-only-tests`. */
const noSnapshotOnlyTestsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
    create(context) {
        return {
            CallExpression(node) {
                const testCall = getTestCall(node);

                if (testCall === undefined) {
                    return;
                }

                const assertions = summarizeAssertions(testCall.callback);

                if (
                    assertions.assertionCount === 0 ||
                    assertions.snapshotAssertionCount !==
                        assertions.assertionCount
                ) {
                    return;
                }

                context.report({
                    messageId: "snapshotOnlyTest",
                    node: testCall.node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "disallow tests whose entire assertion surface is snapshot matching.",
            recommended: true,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.recommended",
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-snapshot-only-tests",
        },
        messages: {
            snapshotOnlyTest:
                "This test only asserts snapshots; add at least one explicit behavioral assertion before relying on snapshot output.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "no-snapshot-only-tests",
});

export default noSnapshotOnlyTestsRule;
