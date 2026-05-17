/**
 * @packageDocumentation
 * Rule that reports executable tests without any assertion.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import { getTestCall, summarizeAssertions } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "missingAssertion";

/** Rule module for `test-signal/require-assertions`. */
const requireAssertionsRule: TSESLint.RuleModule<MessageId> = createTypedRule({
    create(context) {
        return {
            CallExpression(node) {
                const testCall = getTestCall(node);

                if (!isDefined(testCall)) {
                    return;
                }

                const assertions = summarizeAssertions(testCall.callback);

                if (assertions.assertionCount > 0) {
                    return;
                }

                context.report({
                    messageId: "missingAssertion",
                    node: testCall.callback,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "require every executable test to include at least one assertion.",
            recommended: true,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.recommended",
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-assertions",
        },
        messages: {
            missingAssertion:
                "Executable tests must make an assertion; add an `expect(...)` assertion that proves the behavior under test.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-assertions",
});

export default requireAssertionsRule;
