/**
 * @packageDocumentation
 * Rule that reports throw assertions without an expected error shape.
 */
import { AST_NODE_TYPES, type TSESLint } from "@typescript-eslint/utils";

import {
    assertionChainHasProperty,
    getAssertionMatcherCall,
    getTestCall,
    visitDescendants,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "missingErrorExpectation";

const notPropertyNames = new Set(["not"]);
const throwMatcherNames = new Set(["toThrow", "toThrowError"]);

/** Rule module for `test-signal/require-error-message-assertions`. */
const requireErrorMessageAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create(context) {
            return {
                CallExpression(node) {
                    const testCall = getTestCall(node);

                    if (testCall === undefined) {
                        return;
                    }

                    visitDescendants(testCall.callback.body, (descendant) => {
                        if (descendant.type !== AST_NODE_TYPES.CallExpression) {
                            return;
                        }

                        const matcherCall =
                            getAssertionMatcherCall(descendant);

                        if (
                            matcherCall === undefined ||
                            matcherCall.matcherCall.arguments.length > 0 ||
                            !throwMatcherNames.has(matcherCall.matcherName) ||
                            assertionChainHasProperty(
                                matcherCall.expectCall,
                                notPropertyNames
                            )
                        ) {
                            return;
                        }

                        context.report({
                            data: {
                                matcherName: matcherCall.matcherName,
                            },
                            messageId: "missingErrorExpectation",
                            node: matcherCall.matcherCall,
                        });
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require throw and rejection assertions to verify the expected error.",
                recommended: false,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-error-message-assertions",
            },
            messages: {
                missingErrorExpectation:
                    "`{{ matcherName }}()` without an expected error only proves that something threw; assert the error message, class, pattern, or object shape.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "require-error-message-assertions",
    });

export default requireErrorMessageAssertionsRule;
