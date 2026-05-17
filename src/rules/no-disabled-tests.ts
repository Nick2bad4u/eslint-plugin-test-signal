/**
 * @packageDocumentation
 * Rule that reports disabled test and suite declarations.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { isDisabledTestLikeCall } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "disabledTest";

/** Rule module for `test-signal/no-disabled-tests`. */
const noDisabledTestsRule: TSESLint.RuleModule<MessageId> = createTypedRule({
    create(context) {
        return {
            CallExpression(node) {
                if (!isDisabledTestLikeCall(node)) {
                    return;
                }

                context.report({
                    messageId: "disabledTest",
                    node: node.callee,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "disallow skipped, todo, and disabled test declarations that silently reduce coverage.",
            recommended: true,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.recommended",
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-disabled-tests",
        },
        messages: {
            disabledTest:
                "Disabled tests hide missing coverage; restore the test, delete it, or track the gap outside the committed suite.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-disabled-tests",
});

export default noDisabledTestsRule;
