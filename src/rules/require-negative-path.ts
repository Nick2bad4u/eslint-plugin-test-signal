/**
 * @packageDocumentation
 * Rule that reports test files or suites without any negative-path coverage signal.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    getTestCall,
    isTestSuiteCall,
    summarizeAssertions,
    titleHasNegativeSignal,
} from "../_internal/test-ast.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageId = "missingNegativePath";

interface SuiteSummary {
    hasNegativeSignal: boolean;
    node: TSESTree.CallExpression | TSESTree.Program;
    testCount: number;
}

const createSuiteSummary = (
    node: TSESTree.CallExpression | TSESTree.Program
): SuiteSummary => ({
    hasNegativeSignal: false,
    node,
    testCount: 0,
});

/** Rule module for `test-signal/require-negative-path`. */
const requireNegativePathRule: TSESLint.RuleModule<MessageId> =
    createTypedRule({
    create(context) {
        const rootSuite = createSuiteSummary(context.sourceCode.ast);
        const suiteStack: SuiteSummary[] = [rootSuite];
        let hasNestedSuite = false;

        const addTestSignal = (testCall: ReturnType<typeof getTestCall>) => {
            if (testCall === undefined) {
                return;
            }

            const assertions = summarizeAssertions(testCall.callback);
            const hasNegativeSignal =
                assertions.negativeSignalCount > 0 ||
                titleHasNegativeSignal(testCall.title);

            for (const suite of suiteStack) {
                suite.testCount += 1;

                if (hasNegativeSignal) {
                    suite.hasNegativeSignal = true;
                }
            }
        };

        const reportMissingNegativePath = (
            suite: Readonly<SuiteSummary>
        ): void => {
            if (suite.testCount === 0 || suite.hasNegativeSignal) {
                return;
            }

            context.report({
                messageId: "missingNegativePath",
                node: suite.node,
            });
        };

        return {
            CallExpression(node) {
                if (isTestSuiteCall(node)) {
                    hasNestedSuite = true;
                    suiteStack.push(createSuiteSummary(node));
                    return;
                }

                addTestSignal(getTestCall(node));
            },
            "CallExpression:exit"(node) {
                if (!isTestSuiteCall(node)) {
                    return;
                }

                const suite = suiteStack.pop();

                if (suite?.node === node) {
                    reportMissingNegativePath(suite);
                    return;
                }

                if (suite !== undefined) {
                    suiteStack.push(suite);
                }
            },
            "Program:exit"() {
                if (!hasNestedSuite) {
                    reportMissingNegativePath(rootSuite);
                }
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "require test files and suites to include at least one negative-path coverage signal.",
            recommended: false,
            requiresTypeChecking: false,
            testSignalConfigs: [
                "testSignal.configs.strict",
                "testSignal.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-negative-path",
        },
        messages: {
            missingNegativePath:
                "This test scope has no negative-path coverage signal; add a rejection, throw, invalid-input, missing-input, or `.not` assertion case.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "require-negative-path",
});

export default requireNegativePathRule;
