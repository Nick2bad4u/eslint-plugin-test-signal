/**
 * @packageDocumentation
 * Rule that reports string assertions with expected values that match anything.
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

type MessageId = "vacuousStringAssertion";

const directStringMatcherNames = new Set(["toContain", "toMatch"]);
const emptyStringMatcherNames = new Set(["stringContaining"]);
const matchAllRegexSources = new Set([".*", "^.*$"]);

const getStringLiteralValue = (
    node: TSESTree.CallExpressionArgument | undefined
): string | undefined =>
    node?.type === AST_NODE_TYPES.Literal && typeof node.value === "string"
        ? node.value
        : undefined;

const isMatchAllRegexLiteral = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean =>
    node?.type === AST_NODE_TYPES.Literal &&
    node.value instanceof RegExp &&
    setHas(matchAllRegexSources, node.value.source);

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

const isEmptyStringAsymmetricMatcher = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean => {
    if (
        node?.type !== AST_NODE_TYPES.CallExpression ||
        node.callee.type !== AST_NODE_TYPES.MemberExpression ||
        node.callee.object.type !== AST_NODE_TYPES.Identifier ||
        node.callee.object.name !== "expect"
    ) {
        return false;
    }

    const matcherName = getStaticPropertyName(node.callee.property);

    return (
        isDefined(matcherName) &&
        setHas(emptyStringMatcherNames, matcherName) &&
        getStringLiteralValue(arrayAt(node.arguments, 0)) === ""
    );
};

const isVacuousExpectedString = (
    matcherName: string,
    expected: TSESTree.CallExpressionArgument | undefined
): boolean =>
    (setHas(directStringMatcherNames, matcherName) &&
        (getStringLiteralValue(expected) === "" ||
            isMatchAllRegexLiteral(expected))) ||
    isEmptyStringAsymmetricMatcher(expected);

/** Rule module for `test-signal/no-vacuous-string-assertions`. */
const noVacuousStringAssertionsRule: TSESLint.RuleModule<MessageId> =
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
                                !isVacuousExpectedString(
                                    assertion.matcherName,
                                    arrayAt(assertion.matcherCall.arguments, 0)
                                )
                            ) {
                                return;
                            }

                            context.report({
                                data: {
                                    matcherName: assertion.matcherName,
                                },
                                messageId: "vacuousStringAssertion",
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
                    "disallow string assertions with expected values that match anything.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-string-assertions",
            },
            messages: {
                vacuousStringAssertion:
                    "`{{ matcherName }}()` uses an expected string pattern that matches anything; assert the specific text, token, or format the behavior should produce.",
            },
            schema: [],
            type: "problem",
        },
        name: "no-vacuous-string-assertions",
    });

export default noVacuousStringAssertionsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
