/**
 * @packageDocumentation
 * Rule that reports async tests without assertions.
 */

import { AST_NODE_TYPES, type TSESLint } from "@typescript-eslint/utils";
import { isDefined } from "ts-extras";

import { getTestCall, summarizeAssertions } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "emptyAsyncTest";

/** Rule module for `test-signal/no-empty-async-tests`. */
const noEmptyAsyncTestsRule: TSESLint.RuleModule<MessageId> = createTypedRule({
    create: (context) => ({
        CallExpression(node) {
            const testCall = getTestCall(node);
            const callback = testCall?.callback;

            if (
                !isDefined(callback) ||
                !callback.async ||
                callback.body.type !== AST_NODE_TYPES.BlockStatement
            ) {
                return;
            }

            const assertions = summarizeAssertions(callback);

            if (assertions.assertionCount > 0) {
                return;
            }

            context.report({
                messageId: "emptyAsyncTest",
                node: callback,
            });
        },
    }),
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "disallow async tests that never execute an assertion.",
            recommended: true,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.minimal",
                "testSignal.configs.recommended",
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-empty-async-tests",
        },
        messages: {
            emptyAsyncTest:
                "Async tests must include an assertion; add an awaited assertion or remove the unnecessary async test wrapper.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-async-tests",
});

export default noEmptyAsyncTestsRule;
