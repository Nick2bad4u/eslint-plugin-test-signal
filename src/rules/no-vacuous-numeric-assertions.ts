/**
 * @packageDocumentation
 * Rule that reports numeric bound assertions with infinite thresholds.
 */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    assertionChainHasProperty,
    getAssertionMatcherCall,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "vacuousNumericAssertion";

const notPropertyNames = new Set(["not"]);

const getInfiniteSign = (
    node: TSESTree.CallExpressionArgument | undefined
): -1 | 1 | undefined => {
    if (node?.type === AST_NODE_TYPES.Identifier && node.name === "Infinity") {
        return 1;
    }

    if (
        node?.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === "-" &&
        node.argument.type === AST_NODE_TYPES.Identifier &&
        node.argument.name === "Infinity"
    ) {
        return -1;
    }

    return undefined;
};

const isVacuousInfiniteComparison = (
    matcherName: string,
    infiniteSign: -1 | 1 | undefined,
    hasNot: boolean
): boolean => {
    if (infiniteSign === undefined) {
        return false;
    }

    if (!hasNot) {
        return (
            (infiniteSign === 1 &&
                (matcherName === "toBeLessThan" ||
                    matcherName === "toBeLessThanOrEqual")) ||
            (infiniteSign === -1 &&
                (matcherName === "toBeGreaterThan" ||
                    matcherName === "toBeGreaterThanOrEqual"))
        );
    }

    return (
        (infiniteSign === 1 &&
            (matcherName === "toBeGreaterThan" ||
                matcherName === "toBeGreaterThanOrEqual")) ||
        (infiniteSign === -1 &&
            (matcherName === "toBeLessThan" ||
                matcherName === "toBeLessThanOrEqual"))
    );
};

/** Rule module for `test-signal/no-vacuous-numeric-assertions`. */
const noVacuousNumericAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create(context) {
            return {
                CallExpression(node) {
                    const testCall = getTestCall(node);

                    if (testCall === undefined) {
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

                            if (assertion === undefined) {
                                return;
                            }

                            const hasNot = assertionChainHasProperty(
                                assertion.expectCall,
                                notPropertyNames
                            );
                            const infiniteSign = getInfiniteSign(
                                assertion.matcherCall.arguments.at(0)
                            );

                            if (
                                !isVacuousInfiniteComparison(
                                    assertion.matcherName,
                                    infiniteSign,
                                    hasNot
                                )
                            ) {
                                return;
                            }

                            context.report({
                                data: {
                                    matcherName: assertion.matcherName,
                                },
                                messageId: "vacuousNumericAssertion",
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
                    "disallow numeric bound assertions with infinite thresholds.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-numeric-assertions",
            },
            messages: {
                vacuousNumericAssertion:
                    "`{{ matcherName }}()` uses an infinite threshold that proves too little; assert a finite boundary or exact expected value.",
            },
            schema: [],
            type: "problem",
        },
        name: "no-vacuous-numeric-assertions",
    });

export default noVacuousNumericAssertionsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
