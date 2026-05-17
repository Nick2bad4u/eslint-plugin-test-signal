/**
 * @packageDocumentation
 * Rule that reports assertions inside catch blocks.
 */
import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import {
    getTestCall,
    visitDescendants,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "catchAssertion";

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const isAstNode = (value: unknown): value is TSESTree.Node =>
    isRecord(value) && typeof value["type"] === "string";

const getParent = (node: TSESTree.Node): TSESTree.Node | undefined => {
    const parent = isRecord(node) ? node.parent : undefined;

    return isAstNode(parent) ? parent : undefined;
};

const isExpectCall = (node: TSESTree.CallExpression): boolean =>
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === "expect";

const isInsideCatchClause = (
    assertion: TSESTree.CallExpression,
    boundary: TSESTree.Node
): boolean => {
    let current: TSESTree.Node = assertion;

    while (current !== boundary) {
        const parent = getParent(current);

        if (parent === undefined) {
            return false;
        }

        if (
            parent.type === AST_NODE_TYPES.CatchClause &&
            parent.body === current
        ) {
            return true;
        }

        current = parent;
    }

    return false;
};

/** Rule module for `test-signal/no-try-catch-assertions`. */
const noTryCatchAssertionsRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
        create(context) {
            return {
                CallExpression(node) {
                    const testCall = getTestCall(node);

                    if (testCall === undefined) {
                        return;
                    }

                    visitDescendants(testCall.callback.body, (descendant) => {
                        if (
                            descendant.type !== AST_NODE_TYPES.CallExpression ||
                            !isExpectCall(descendant) ||
                            !isInsideCatchClause(
                                descendant,
                                testCall.callback.body
                            )
                        ) {
                            return;
                        }

                        context.report({
                            messageId: "catchAssertion",
                            node: descendant,
                        });
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "disallow assertions inside catch blocks that can be skipped when the try block does not throw.",
                recommended: false,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-try-catch-assertions",
            },
            messages: {
                catchAssertion:
                    "Assertions inside catch blocks are skipped when the try block does not throw; use `await expect(promise).rejects...` or assert the captured error after the catch.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-try-catch-assertions",
    });

export default noTryCatchAssertionsRule;
