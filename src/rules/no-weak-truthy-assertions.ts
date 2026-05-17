/**
 * @packageDocumentation
 * Rule that reports truthy/falsy assertions that do not verify a concrete value.
 */

import { AST_NODE_TYPES, type TSESLint } from "@typescript-eslint/utils";
import { isDefined, setHas } from "ts-extras";

import {
    getAssertionMatcherCall,
    getTestCall,
    visitDescendants,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "weakTruthyAssertion";

const weakTruthyMatcherNames = new Set(["toBeFalsy", "toBeTruthy"]);

/** Rule module for `test-signal/no-weak-truthy-assertions`. */
const noWeakTruthyAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create(context) {
            return {
                CallExpression(node) {
                    const testCall = getTestCall(node);

                    if (!isDefined(testCall)) {
                        return;
                    }

                    visitDescendants(testCall.callback.body, (descendant) => {
                        if (descendant.type !== AST_NODE_TYPES.CallExpression) {
                            return;
                        }

                        const matcherCall = getAssertionMatcherCall(descendant);

                        if (
                            !isDefined(matcherCall) ||
                            !setHas(
                                weakTruthyMatcherNames,
                                matcherCall.matcherName
                            )
                        ) {
                            return;
                        }

                        context.report({
                            data: {
                                matcherName: matcherCall.matcherName,
                            },
                            messageId: "weakTruthyAssertion",
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
                    "disallow broad truthy and falsy assertions in executable tests.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-truthy-assertions",
            },
            messages: {
                weakTruthyAssertion:
                    "`{{ matcherName }}()` is a weak assertion; assert the exact boolean, value, length, or object shape instead.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-weak-truthy-assertions",
    });

export default noWeakTruthyAssertionsRule;
