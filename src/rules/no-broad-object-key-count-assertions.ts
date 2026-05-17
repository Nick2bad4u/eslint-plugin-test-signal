/**
 * @packageDocumentation
 * Rule that reports object key-count assertions that only prove an object is non-empty.
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

type MessageId = "broadObjectKeyCountAssertion";

const notPropertyNames = new Set(["not"]);

const getNumericLiteralValue = (
    node: TSESTree.CallExpressionArgument | undefined
): number | undefined => {
    if (node?.type === AST_NODE_TYPES.Literal) {
        return typeof node.value === "number" ? node.value : undefined;
    }

    return undefined;
};

const isObjectKeysLengthSubject = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean =>
    node?.type === AST_NODE_TYPES.MemberExpression &&
    !node.computed &&
    node.property.type === AST_NODE_TYPES.Identifier &&
    node.property.name === "length" &&
    node.object.type === AST_NODE_TYPES.CallExpression &&
    node.object.callee.type === AST_NODE_TYPES.MemberExpression &&
    node.object.callee.object.type === AST_NODE_TYPES.Identifier &&
    node.object.callee.object.name === "Object" &&
    node.object.callee.property.type === AST_NODE_TYPES.Identifier &&
    node.object.callee.property.name === "keys";

const isNonEmptyKeyCountAssertion = (
    matcherName: string,
    expectedValue: number | undefined,
    hasNot: boolean
): boolean => {
    if (!isDefined(expectedValue)) {
        return false;
    }

    if (!hasNot) {
        return (
            (matcherName === "toBeGreaterThan" && expectedValue === 0) ||
            (matcherName === "toBeGreaterThanOrEqual" && expectedValue === 1)
        );
    }

    return (
        (matcherName === "toBe" && expectedValue === 0) ||
        (matcherName === "toHaveLength" && expectedValue === 0)
    );
};

/** Rule module for `test-signal/no-broad-object-key-count-assertions`. */
const noBroadObjectKeyCountAssertionsRule: TSESLint.RuleModule<MessageId> =
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
                                !isObjectKeysLengthSubject(
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
                                !isNonEmptyKeyCountAssertion(
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
                                messageId: "broadObjectKeyCountAssertion",
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
                    "disallow object key-count assertions that only prove an object is non-empty.",
                recommended: false,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-broad-object-key-count-assertions",
            },
            messages: {
                broadObjectKeyCountAssertion:
                    "`{{ matcherName }}()` only proves that `Object.keys(...)` is non-empty; assert the expected keys or object shape instead.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-broad-object-key-count-assertions",
    });

export default noBroadObjectKeyCountAssertionsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
