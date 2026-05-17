/**
 * @packageDocumentation
 * Rule that reports assertions whose subject is a static constant.
 */
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

type MessageId = "constantAssertion";

const weakTruthyMatcherNames = new Set(["toBeFalsy", "toBeTruthy"]);

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

const isExpressionNode = (node: TSESTree.Node): node is TSESTree.Expression =>
    node.type !== AST_NODE_TYPES.AssignmentPattern &&
    node.type !== AST_NODE_TYPES.ObjectPattern &&
    node.type !== AST_NODE_TYPES.ArrayPattern;

function isStaticConstantExpression(node: TSESTree.Expression): boolean {
    const expression = unwrapExpression(node);

    if (expression.type === AST_NODE_TYPES.ArrayExpression) {
        return expression.elements.every(
            (element) =>
                element !== null &&
                element.type !== AST_NODE_TYPES.SpreadElement &&
                isStaticConstantExpression(element)
        );
    }

    if (expression.type === AST_NODE_TYPES.Identifier) {
        return (
            expression.name === "Infinity" ||
            expression.name === "NaN" ||
            expression.name === "undefined"
        );
    }

    if (expression.type === AST_NODE_TYPES.Literal) {
        return true;
    }

    if (expression.type === AST_NODE_TYPES.ObjectExpression) {
        return expression.properties.every((property) => {
            if (
                property.type === AST_NODE_TYPES.SpreadElement ||
                !isExpressionNode(property.value)
            ) {
                return false;
            }

            if (
                property.computed &&
                (!isExpressionNode(property.key) ||
                    !isStaticConstantExpression(property.key))
            ) {
                return false;
            }

            return isStaticConstantExpression(property.value);
        });
    }

    if (expression.type === AST_NODE_TYPES.TemplateLiteral) {
        return expression.expressions.length === 0;
    }

    return (
        expression.type === AST_NODE_TYPES.UnaryExpression &&
        isStaticConstantExpression(expression.argument)
    );
}

/** Rule module for `test-signal/no-constant-assertions`. */
const noConstantAssertionsRule: TSESLint.RuleModule<MessageId> =
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

                            const actual = arrayAt(
                                assertion.expectCall.arguments,
                                0
                            );

                            if (!isDefined(actual)) {
                                return;
                            }

                            if (actual.type === AST_NODE_TYPES.SpreadElement) {
                                return;
                            }

                            if (
                                setHas(
                                    weakTruthyMatcherNames,
                                    assertion.matcherName
                                )
                            ) {
                                return;
                            }

                            if (!isStaticConstantExpression(actual)) {
                                return;
                            }

                            context.report({
                                messageId: "constantAssertion",
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
                    "disallow assertions whose subject is a static constant.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-constant-assertions",
            },
            messages: {
                constantAssertion:
                    "This assertion checks a static constant instead of behavior; assert a value produced by the code under test.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-constant-assertions",
    });

export default noConstantAssertionsRule;
