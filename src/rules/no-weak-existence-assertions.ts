/**
 * @packageDocumentation
 * Rule that reports broad existence assertions that do not verify a concrete value.
 */

import { AST_NODE_TYPES, type TSESLint } from "@typescript-eslint/utils";
import { isDefined, setHas } from "ts-extras";

import {
    assertionChainHasProperty,
    getAssertionMatcherCall,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "weakExistenceAssertion";

const notPropertyNames = new Set(["not"]);
const negatedAbsenceMatcherNames = new Set(["toBeNull", "toBeUndefined"]);

/** Rule module for `test-signal/no-weak-existence-assertions`. */
const noWeakExistenceAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create(context) {
            return {
                CallExpression(node) {
                    const testCall = getTestCall(node);

                    if (!isDefined(testCall)) {
                        return;
                    }

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

                            if (!isDefined(assertion)) {
                                return;
                            }

                            const hasNot = assertionChainHasProperty(
                                assertion.expectCall,
                                notPropertyNames
                            );
                            const isWeakDefinedAssertion =
                                assertion.matcherName === "toBeDefined" &&
                                !hasNot;
                            const isWeakNegatedAbsenceAssertion =
                                hasNot &&
                                setHas(
                                    negatedAbsenceMatcherNames,
                                    assertion.matcherName
                                );

                            if (
                                !isWeakDefinedAssertion &&
                                !isWeakNegatedAbsenceAssertion
                            ) {
                                return;
                            }

                            context.report({
                                data: {
                                    matcherName: assertion.matcherName,
                                },
                                messageId: "weakExistenceAssertion",
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
                    "disallow broad existence assertions in executable tests.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-existence-assertions",
            },
            messages: {
                weakExistenceAssertion:
                    "`{{ matcherName }}()` only proves broad existence; assert the expected value, shape, length, or absence explicitly.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-weak-existence-assertions",
    });

export default noWeakExistenceAssertionsRule;
