/**
 * @packageDocumentation
 * Rule that reports floating Promise assertions.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import { getTestCall, summarizeAssertions } from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "unawaitedAsyncAssertion";

/** Rule module for `test-signal/require-awaited-async-assertions`. */
const requireAwaitedAsyncAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create: (context) => ({
            CallExpression(node) {
                const testCall = getTestCall(node);

                if (!isDefined(testCall)) {
                    return;
                }

                const assertions = summarizeAssertions(testCall.callback);

                for (const assertionNode of assertions.unawaitedAsyncAssertionNodes) {
                    context.report({
                        messageId: "unawaitedAsyncAssertion",
                        node: assertionNode,
                    });
                }
            },
        }),
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require Promise-based `.resolves` and `.rejects` assertions to be awaited or returned.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.minimal",
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-awaited-async-assertions",
            },
            messages: {
                unawaitedAsyncAssertion:
                    "Promise assertions using `.resolves` or `.rejects` must be awaited or returned so the test cannot pass before the assertion runs.",
            },
            schema: [],
            type: "problem",
        },
        name: "require-awaited-async-assertions",
    });

export default requireAwaitedAsyncAssertionsRule;
