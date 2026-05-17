/**
 * @packageDocumentation
 * Rule that reports assertions comparing a value to itself.
 */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayAt, isDefined, setHas } from "ts-extras";

import {
    getAssertionMatcherCall,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "identicalExpectedActual";

const equalityMatcherNames = new Set([
    "toBe",
    "toEqual",
    "toMatchObject",
    "toStrictEqual",
]);

function unwrapExpression(node: TSESTree.Expression): TSESTree.Expression {
    let current = node;

    while (
        current.type === AST_NODE_TYPES.TSAsExpression ||
        current.type === AST_NODE_TYPES.TSInstantiationExpression ||
        current.type === AST_NODE_TYPES.TSNonNullExpression ||
        current.type === AST_NODE_TYPES.TSTypeAssertion
    ) {
        current = current.expression;
    }

    return current;
}

const isComparableExpression = (
    node: TSESTree.CallExpressionArgument
): node is TSESTree.Expression => node.type !== AST_NODE_TYPES.SpreadElement;

const getComparableText = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: TSESTree.CallExpressionArgument | undefined
): string | undefined =>
    !isDefined(node) || !isComparableExpression(node)
        ? undefined
        : sourceCode.getText(unwrapExpression(node));

/** Rule module for `test-signal/no-identical-expected-actual`. */
const noIdenticalExpectedActualRule: TSESLint.RuleModule<MessageId> =
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
                                !setHas(
                                    equalityMatcherNames,
                                    assertion.matcherName
                                )
                            ) {
                                return;
                            }

                            const actualText = getComparableText(
                                context.sourceCode,
                                arrayAt(assertion.expectCall.arguments, 0)
                            );
                            const expectedText = getComparableText(
                                context.sourceCode,
                                arrayAt(assertion.matcherCall.arguments, 0)
                            );

                            if (
                                !isDefined(actualText) ||
                                !isDefined(expectedText) ||
                                actualText !== expectedText
                            ) {
                                return;
                            }

                            context.report({
                                data: {
                                    matcherName: assertion.matcherName,
                                },
                                messageId: "identicalExpectedActual",
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
                    "disallow assertions that compare a value to itself.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-identical-expected-actual",
            },
            messages: {
                identicalExpectedActual:
                    "`{{ matcherName }}()` compares the assertion subject to itself; assert the independent expected value instead.",
            },
            schema: [],
            type: "problem",
        },
        name: "no-identical-expected-actual",
    });

export default noIdenticalExpectedActualRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
