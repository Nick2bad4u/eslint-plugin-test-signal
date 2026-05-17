/**
 * @packageDocumentation
 * Rule that reports repeated identical assertion chains in the same test.
 */
import { AST_NODE_TYPES, type TSESLint } from "@typescript-eslint/utils";

import {
    getAssertionMatcherCall,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "duplicateAssertion";

const normalizeAssertionText = (text: string): string =>
    text.replaceAll(/\s+/gv, "");

/** Rule module for `test-signal/no-duplicate-assertions`. */
const noDuplicateAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create(context) {
            return {
                CallExpression(node) {
                    const testCall = getTestCall(node);

                    if (testCall === undefined) {
                        return;
                    }

                    const seenAssertionTexts = new Set<string>();

                    visitDescendantsOutsideNestedFunctions(
                        testCall.callback.body,
                        (descendant) => {
                            if (
                                descendant.type !==
                                AST_NODE_TYPES.CallExpression
                            ) {
                                return;
                            }

                            const assertion =
                                getAssertionMatcherCall(descendant);

                            if (assertion === undefined) {
                                return;
                            }

                            const assertionText = normalizeAssertionText(
                                context.sourceCode.getText(
                                    assertion.matcherCall
                                )
                            );

                            if (!seenAssertionTexts.has(assertionText)) {
                                seenAssertionTexts.add(assertionText);
                                return;
                            }

                            context.report({
                                messageId: "duplicateAssertion",
                                node: assertion.matcherCall,
                            });
                        }
                    );
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "disallow repeated identical assertion chains in the same test.",
                recommended: false,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-duplicate-assertions",
            },
            messages: {
                duplicateAssertion:
                    "This assertion duplicates an earlier assertion in the same test; remove it or assert a distinct behavior signal.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-duplicate-assertions",
    });

export default noDuplicateAssertionsRule;
