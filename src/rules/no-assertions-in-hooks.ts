/**
 * @packageDocumentation
 * Rule that reports assertions hidden in test lifecycle hooks.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    containsExpectCallOutsideNestedFunctions,
    isExpectLikeCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "assertionInHook";

const hookFunctionNames = new Set([
    "afterAll",
    "afterEach",
    "beforeAll",
    "beforeEach",
]);

const getHookName = (
    callee: TSESTree.CallExpression["callee"]
): string | undefined =>
    callee.type === AST_NODE_TYPES.Identifier &&
    hookFunctionNames.has(callee.name)
        ? callee.name
        : undefined;

const getHookCallback = (
    node: TSESTree.CallExpression
):
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionExpression
    | undefined => {
    const callback = node.arguments.at(0);

    if (
        callback?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        callback?.type === AST_NODE_TYPES.FunctionExpression
    ) {
        return callback;
    }

    return undefined;
};

const reportHookAssertions = (
    context: TSESLint.RuleContext<MessageId, []>,
    hookName: string,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects.
    callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
): void => {
    visitDescendantsOutsideNestedFunctions(callback.body, (descendant) => {
        if (
            descendant.type === AST_NODE_TYPES.CallExpression &&
            isExpectLikeCall(descendant)
        ) {
            context.report({
                data: {
                    hookName,
                },
                messageId: "assertionInHook",
                node: descendant,
            });
        }
    });
};

/** Rule module for `test-signal/no-assertions-in-hooks`. */
const noAssertionsInHooksRule: TSESLint.RuleModule<MessageId> = createTypedRule(
    {
        create(context) {
            return {
                CallExpression(node) {
                    const hookName = getHookName(node.callee);

                    if (hookName === undefined) {
                        return;
                    }

                    const callback = getHookCallback(node);

                    if (
                        callback === undefined ||
                        !containsExpectCallOutsideNestedFunctions(callback.body)
                    ) {
                        return;
                    }

                    reportHookAssertions(context, hookName, callback);
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "disallow assertions hidden inside test lifecycle hooks.",
                recommended: false,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-assertions-in-hooks",
            },
            messages: {
                assertionInHook:
                    "Assertions inside `{{ hookName }}` are hidden setup or teardown checks; move this `expect` into an explicit `it(...)` or `test(...)` case.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-assertions-in-hooks",
    }
);

export default noAssertionsInHooksRule;
