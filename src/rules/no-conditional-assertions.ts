/**
 * @packageDocumentation
 * Rule that reports assertions hidden behind conditional control flow.
 */
import { AST_NODE_TYPES, type TSESLint, type TSESTree } from "@typescript-eslint/utils";

import {
    getTestCall,
    visitDescendants,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "conditionalAssertion";

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

const isConditionalBranch = (
    node: TSESTree.Node,
    parent: TSESTree.Node
): boolean => {
    if (parent.type === AST_NODE_TYPES.ConditionalExpression) {
        return parent.consequent === node || parent.alternate === node;
    }

    if (parent.type === AST_NODE_TYPES.IfStatement) {
        return parent.consequent === node || parent.alternate === node;
    }

    if (parent.type === AST_NODE_TYPES.LogicalExpression) {
        return parent.right === node;
    }

	if (parent.type === AST_NODE_TYPES.SwitchCase) {
		const consequent: readonly TSESTree.Node[] = parent.consequent;

		return consequent.includes(node);
	}

    return false;
};

const isInsideConditionalBranch = (
    assertion: TSESTree.CallExpression,
    boundary: TSESTree.Node
): boolean => {
    let current: TSESTree.Node = assertion;

    while (current !== boundary) {
        const parent = getParent(current);

        if (parent === undefined) {
            return false;
        }

        if (isConditionalBranch(current, parent)) {
            return true;
        }

        current = parent;
    }

    return false;
};

/** Rule module for `test-signal/no-conditional-assertions`. */
const noConditionalAssertionsRule: TSESLint.RuleModule<MessageId> =
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
                            !isInsideConditionalBranch(
                                descendant,
                                testCall.callback.body
                            )
                        ) {
                            return;
                        }

                        context.report({
                            messageId: "conditionalAssertion",
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
                    "disallow assertions that only run behind conditional control flow.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-conditional-assertions",
            },
            messages: {
                conditionalAssertion:
                    "Assertions must run deterministically; move this expectation out of conditional control flow or split the branch into a separate test.",
            },
            schema: [],
            type: "problem",
        },
        name: "no-conditional-assertions",
    });

export default noConditionalAssertionsRule;
