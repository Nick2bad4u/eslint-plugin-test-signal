/**
 * @packageDocumentation
 * Rule that reports vacuous whole-value asymmetric assertions.
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

type ExpectMemberCall = Readonly<{
    matcherName: string;
    node: TSESTree.CallExpression;
}>;

type MessageId = "weakAsymmetricAssertion" | "weakEmptySubsetAssertion";

const objectConstructorNames = new Set([
    "Array",
    "Function",
    "Object",
]);
const subsetMatcherNames = new Set(["toMatchObject"]);
const wholeValueMatcherNames = new Set([
    "toBe",
    "toEqual",
    "toStrictEqual",
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

const getExpectMemberCall = (
    node: TSESTree.Expression
): ExpectMemberCall | undefined => {
    if (
        node.type !== AST_NODE_TYPES.CallExpression ||
        node.callee.type !== AST_NODE_TYPES.MemberExpression
    ) {
        return undefined;
    }

    const matcherName =
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === "expect"
            ? getStaticPropertyName(node.callee.property)
            : undefined;

    return isDefined(matcherName)
        ? {
              matcherName,
              node,
          }
        : undefined;
};

const isEmptyArrayExpression = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean =>
    node?.type === AST_NODE_TYPES.ArrayExpression && node.elements.length === 0;

const isEmptyObjectExpression = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean =>
    node?.type === AST_NODE_TYPES.ObjectExpression &&
    node.properties.length === 0;

const isBroadAnyConstructorArgument = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean =>
    node?.type === AST_NODE_TYPES.Identifier &&
    setHas(objectConstructorNames, node.name);

const isVacuousAsymmetricMatcher = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean => {
    if (node?.type === AST_NODE_TYPES.SpreadElement) {
        return false;
    }

    if (!isDefined(node)) {
        return false;
    }

    const memberCall = getExpectMemberCall(node);

    if (memberCall?.matcherName === "anything") {
        return true;
    }

    if (memberCall?.matcherName === "any") {
        return isBroadAnyConstructorArgument(
            arrayAt(memberCall.node.arguments, 0)
        );
    }

    if (memberCall?.matcherName === "arrayContaining") {
        return isEmptyArrayExpression(arrayAt(memberCall.node.arguments, 0));
    }

    return (
        memberCall?.matcherName === "objectContaining" &&
        isEmptyObjectExpression(arrayAt(memberCall.node.arguments, 0))
    );
};

const isWeakEmptySubsetAssertion = (
    matcherName: string,
    expected: TSESTree.CallExpressionArgument | undefined
): boolean =>
    setHas(subsetMatcherNames, matcherName) &&
    expected?.type === AST_NODE_TYPES.ObjectExpression &&
    expected.properties.length === 0;

/** Rule module for `test-signal/no-weak-asymmetric-assertions`. */
const noWeakAsymmetricAssertionsRule: TSESLint.RuleModule<MessageId> =
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

                            const expected = arrayAt(
                                assertion.matcherCall.arguments,
                                0
                            );

                            if (
                                setHas(
                                    wholeValueMatcherNames,
                                    assertion.matcherName
                                ) &&
                                isVacuousAsymmetricMatcher(expected)
                            ) {
                                context.report({
                                    data: {
                                        matcherName: assertion.matcherName,
                                    },
                                    messageId: "weakAsymmetricAssertion",
                                    node: assertion.matcherCall,
                                });
                                return;
                            }

                            if (
                                isWeakEmptySubsetAssertion(
                                    assertion.matcherName,
                                    expected
                                )
                            ) {
                                context.report({
                                    data: {
                                        matcherName: assertion.matcherName,
                                    },
                                    messageId: "weakEmptySubsetAssertion",
                                    node: assertion.matcherCall,
                                });
                            }
                        }
                    );
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "disallow vacuous whole-value asymmetric assertions.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-asymmetric-assertions",
            },
            messages: {
                weakAsymmetricAssertion:
                    "`{{ matcherName }}()` uses a whole-value asymmetric matcher that proves too little; assert a concrete value, shape, length, or specific field type.",
                weakEmptySubsetAssertion:
                    "`{{ matcherName }}()` with an empty expected object always matches object-like results; assert at least one expected property.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-weak-asymmetric-assertions",
    });

export default noWeakAsymmetricAssertionsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
