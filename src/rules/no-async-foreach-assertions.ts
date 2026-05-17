/**
 * @packageDocumentation
 * Rule that reports async assertion callbacks passed to `forEach`.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    containsExpectCallOutsideNestedFunctions,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "asyncForeachAssertion";

const getMemberPropertyName = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects.
    property: TSESTree.MemberExpression["property"]
): string | undefined => {
    if (property.type === AST_NODE_TYPES.Identifier) {
        return property.name;
    }

    return property.type === AST_NODE_TYPES.Literal &&
        typeof property.value === "string"
        ? property.value
        : undefined;
};

const getAsyncCallbackArgument = (
    node: TSESTree.CallExpression
):
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionExpression
    | undefined => {
    const callback = node.arguments.at(0);

    if (
        (callback?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            callback?.type === AST_NODE_TYPES.FunctionExpression) &&
        callback.async
    ) {
        return callback;
    }

    return undefined;
};

const isForEachCall = (node: TSESTree.CallExpression): boolean =>
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    getMemberPropertyName(node.callee.property) === "forEach";

/** Rule module for `test-signal/no-async-foreach-assertions`. */
const noAsyncForeachAssertionsRule: TSESLint.RuleModule<MessageId> =
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
                                    AST_NODE_TYPES.CallExpression ||
                                !isForEachCall(descendant)
                            ) {
                                return;
                            }

                            const callback =
                                getAsyncCallbackArgument(descendant);

                            if (
                                callback === undefined ||
                                !containsExpectCallOutsideNestedFunctions(
                                    callback.body
                                )
                            ) {
                                return;
                            }

                            context.report({
                                messageId: "asyncForeachAssertion",
                                node: callback,
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
                    "disallow async assertion callbacks passed to forEach in executable tests.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-async-foreach-assertions",
            },
            messages: {
                asyncForeachAssertion:
                    "`forEach` does not await async callbacks, so assertions inside this callback can run after the test has already finished. Use `for...of` with `await`, or `await Promise.all(items.map(...))`.",
            },
            schema: [],
            type: "problem",
        },
        name: "no-async-foreach-assertions",
    });

export default noAsyncForeachAssertionsRule;
