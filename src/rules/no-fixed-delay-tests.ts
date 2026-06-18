/**
 * @packageDocumentation
 * Rule that reports fixed real-time delays in executable tests.
 */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayAt, isDefined, setHas } from "ts-extras";

import {
    getTestCall,
    visitDescendants,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "fixedDelay";

const delayFunctionNames = new Set([
    "delay",
    "sleep",
    "timeout",
    "wait",
]);

const getStaticPropertyName = (
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

const getCalleeName = (
    callee: TSESTree.CallExpression["callee"]
): string | undefined => {
    if (callee.type === AST_NODE_TYPES.Identifier) {
        return callee.name;
    }

    return callee.type === AST_NODE_TYPES.MemberExpression
        ? getStaticPropertyName(callee.property)
        : undefined;
};

const isNumericDelayArgument = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean => {
    if (node?.type !== AST_NODE_TYPES.Literal) {
        return false;
    }

    return typeof node.value === "number" && node.value > 0;
};

const isSetTimeoutCallWithDelay = (node: TSESTree.CallExpression): boolean =>
    getCalleeName(node.callee) === "setTimeout" &&
    isNumericDelayArgument(arrayAt(node.arguments, 1));

const isPromiseConstructor = (node: TSESTree.NewExpression): boolean =>
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === "Promise";

const isFixedDelayHelperCall = (node: TSESTree.CallExpression): boolean => {
    const calleeName = getCalleeName(node.callee);

    return (
        isDefined(calleeName) &&
        (calleeName === "waitForTimeout" ||
            setHas(delayFunctionNames, calleeName)) &&
        isNumericDelayArgument(arrayAt(node.arguments, 0))
    );
};

const promiseExecutorContainsFixedDelay = (
    node: TSESTree.NewExpression
): boolean => {
    const executor = arrayAt(node.arguments, 0);

    if (
        executor?.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
        executor?.type !== AST_NODE_TYPES.FunctionExpression
    ) {
        return false;
    }

    let isContainsFixedDelay = false;

    visitDescendants(executor.body, (descendant) => {
        if (
            !isContainsFixedDelay &&
            descendant.type === AST_NODE_TYPES.CallExpression &&
            isSetTimeoutCallWithDelay(descendant)
        ) {
            isContainsFixedDelay = true;
        }
    });

    return isContainsFixedDelay;
};

/** Rule module for `test-signal/no-fixed-delay-tests`. */
const noFixedDelayTestsRule: TSESLint.RuleModule<MessageId> = createTypedRule({
    create: (context) => ({
        CallExpression(node) {
            const testCall = getTestCall(node);

            if (!isDefined(testCall)) {
                return;
            }

            visitDescendantsOutsideNestedFunctions(
                testCall.callback.body,
                (descendant) => {
                    if (
                        descendant.type === AST_NODE_TYPES.CallExpression &&
                        (isFixedDelayHelperCall(descendant) ||
                            isSetTimeoutCallWithDelay(descendant))
                    ) {
                        context.report({
                            messageId: "fixedDelay",
                            node: descendant,
                        });
                        return;
                    }

                    if (
                        descendant.type === AST_NODE_TYPES.NewExpression &&
                        isPromiseConstructor(descendant) &&
                        promiseExecutorContainsFixedDelay(descendant)
                    ) {
                        context.report({
                            messageId: "fixedDelay",
                            node: descendant,
                        });
                    }
                }
            );
        },
    }),
    defaultOptions: [],
    meta: {
        docs: {
            description: "disallow fixed real-time delays in executable tests.",
            recommended: false,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-fixed-delay-tests",
        },
        messages: {
            fixedDelay:
                "Fixed real-time waits make tests slow and flaky; wait for an observable condition or use fake timers instead.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "no-fixed-delay-tests",
});

export default noFixedDelayTestsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
