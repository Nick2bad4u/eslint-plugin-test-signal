/**
 * @packageDocumentation
 * Rule that reports focused test and suite declarations.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { isFocusedTestLikeCall } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "focusedTest";

/** Rule module for `test-signal/no-focused-tests`. */
const noFocusedTestsRule: TSESLint.RuleModule<MessageId> = createTypedRule({
    create: (context) => ({
        CallExpression(node) {
            if (!isFocusedTestLikeCall(node)) {
                return;
            }

            context.report({
                messageId: "focusedTest",
                node: node.callee,
            });
        },
    }),
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "disallow focused tests and suites that hide the rest of the test file.",
            recommended: true,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.minimal",
                "testSignal.configs.recommended",
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-focused-tests",
        },
        messages: {
            focusedTest:
                "Focused tests only run part of the suite; remove `.only` or the focused test alias before committing.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-focused-tests",
});

export default noFocusedTestsRule;
