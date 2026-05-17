/**
 * @packageDocumentation
 * Rule that reports length assertions that are always true for normal arrays and strings.
 */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayAt, isDefined } from "ts-extras";

import {
    assertionChainHasProperty,
    getAssertionMatcherCall,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "tautologicalLengthAssertion";

const notPropertyNames = new Set(["not"]);

const isLengthMemberExpression = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean => {
    if (node?.type !== AST_NODE_TYPES.MemberExpression || node.computed) {
        return false;
    }

    return (
        node.property.type === AST_NODE_TYPES.Identifier &&
        node.property.name === "length"
    );
};

const getNumericLiteralValue = (
    node: TSESTree.CallExpressionArgument | undefined
): number | undefined => {
    if (node?.type === AST_NODE_TYPES.Literal) {
        return typeof node.value === "number" ? node.value : undefined;
    }

    if (
        node?.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === "-" &&
        node.argument.type === AST_NODE_TYPES.Literal &&
        typeof node.argument.value === "number"
    ) {
        return -node.argument.value;
    }

    return undefined;
};

const isTautologicalLengthComparison = (
    matcherName: string,
    expectedValue: number | undefined,
    hasNot: boolean
): boolean => {
    if (!isDefined(expectedValue)) {
        return false;
    }

    if (!hasNot) {
        return (
            (matcherName === "toBeGreaterThan" && expectedValue < 0) ||
            (matcherName === "toBeGreaterThanOrEqual" && expectedValue <= 0)
        );
    }

    return (
        (matcherName === "toBeLessThan" && expectedValue <= 0) ||
        (matcherName === "toBeLessThanOrEqual" && expectedValue < 0)
    );
};

/** Rule module for `test-signal/no-tautological-length-assertions`. */
const noTautologicalLengthAssertionsRule: TSESLint.RuleModule<MessageId> =
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

                            if (
                                !isDefined(assertion) ||
                                !isLengthMemberExpression(
                                    arrayAt(assertion.expectCall.arguments, 0)
                                )
                            ) {
                                return;
                            }

                            const hasNot = assertionChainHasProperty(
                                assertion.expectCall,
                                notPropertyNames
                            );
                            const expectedValue = getNumericLiteralValue(
                                arrayAt(assertion.matcherCall.arguments, 0)
                            );

                            if (
                                !isTautologicalLengthComparison(
                                    assertion.matcherName,
                                    expectedValue,
                                    hasNot
                                )
                            ) {
                                return;
                            }

                            context.report({
                                data: {
                                    matcherName: assertion.matcherName,
                                },
                                messageId: "tautologicalLengthAssertion",
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
                    "disallow length assertions that only prove length is non-negative.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-tautological-length-assertions",
            },
            messages: {
                tautologicalLengthAssertion:
                    "`{{ matcherName }}()` only proves `.length` is non-negative; assert the exact length, a minimum positive length, or the expected contents.",
            },
            schema: [],
            type: "problem",
        },
        name: "no-tautological-length-assertions",
    });

export default noTautologicalLengthAssertionsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
