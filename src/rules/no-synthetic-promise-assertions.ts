/**
 * @packageDocumentation
 * Rule that reports `.resolves` and `.rejects` assertions against synthetic
 * Promise values.
 */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects. */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    assertionChainHasProperty,
    getAssertionMatcherCall,
    getTestCall,
    visitDescendantsOutsideNestedFunctions,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "syntheticPromiseAssertion";

const promiseModifierNames = new Set(["rejects", "resolves"]);
const syntheticPromiseMethodNames = new Set(["reject", "resolve"]);

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

const isSyntheticPromiseCall = (
    node: TSESTree.CallExpressionArgument | undefined
): boolean => {
    if (
        node?.type !== AST_NODE_TYPES.CallExpression ||
        node.callee.type !== AST_NODE_TYPES.MemberExpression ||
        node.callee.object.type !== AST_NODE_TYPES.Identifier ||
        node.callee.object.name !== "Promise"
    ) {
        return false;
    }

    const propertyName = getStaticPropertyName(node.callee.property);

    return (
        propertyName !== undefined &&
        syntheticPromiseMethodNames.has(propertyName)
    );
};

/** Rule module for `test-signal/no-synthetic-promise-assertions`. */
const noSyntheticPromiseAssertionsRule: TSESLint.RuleModule<MessageId> =
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
                                AST_NODE_TYPES.CallExpression
                            ) {
                                return;
                            }

                            const assertion =
                                getAssertionMatcherCall(descendant);

                            if (
                                assertion === undefined ||
                                !assertionChainHasProperty(
                                    assertion.expectCall,
                                    promiseModifierNames
                                ) ||
                                !isSyntheticPromiseCall(
                                    assertion.expectCall.arguments.at(0)
                                )
                            ) {
                                return;
                            }

                            context.report({
                                messageId: "syntheticPromiseAssertion",
                                node: assertion.expectCall,
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
                    "disallow `.resolves` and `.rejects` assertions against synthetic Promise values.",
                recommended: true,
                requiresTypeChecking: false,
                testSignalConfigs: [
                    "testSignal.configs.recommended",
                    "testSignal.configs.strict",
                    "testSignal.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-synthetic-promise-assertions",
            },
            messages: {
                syntheticPromiseAssertion:
                    "This async assertion checks a synthetic Promise value instead of a promise returned by code under test.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "no-synthetic-promise-assertions",
    });

export default noSyntheticPromiseAssertionsRule;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types -- Resume readonly parameter checks outside ESTree helpers. */
