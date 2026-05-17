/**
 * @packageDocumentation
 * Rule that reports tests whose only assertions inspect mock call metadata.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { getTestCall, summarizeAssertions } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "mockCallOnlyTest";

/** Rule module for `test-signal/no-mock-call-only-tests`. */
const noMockCallOnlyTestsRule: TSESLint.RuleModule<MessageId> =
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
                    assertions.mockCallAssertionCount !==
                        assertions.assertionCount
                ) {
                    return;
                }

                context.report({
                    messageId: "mockCallOnlyTest",
                    node: testCall.node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "disallow tests whose only assertions inspect mock calls or return counts.",
            recommended: true,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.recommended",
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-mock-call-only-tests",
        },
        messages: {
            mockCallOnlyTest:
                "This test only asserts mock call metadata; add an outcome assertion that proves behavior visible to the caller.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "no-mock-call-only-tests",
});

export default noMockCallOnlyTestsRule;
