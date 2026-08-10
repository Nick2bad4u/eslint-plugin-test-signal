/**
 * @packageDocumentation
 * Focused behavior coverage for shared test AST recognition and traversal.
 */
import { parseForESLint } from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";

import {
    assertionChainHasProperty,
    containsExpectCallOutsideNestedFunctions,
    getAssertionMatcherCall,
    getTestCall,
    isDisabledTestLikeCall,
    isExpectLikeCall,
    isFocusedTestLikeCall,
    isTestSuiteCall,
    summarizeAssertions,
    type TestCallback,
    titleHasNegativeSignal,
    visitDescendants,
    visitDescendantsOutsideNestedFunctions,
} from "../src/_internal/test-ast";

interface ParsedFixture {
    readonly call: (source: string) => TSESTree.CallExpression;
    readonly program: TSESTree.Program;
    readonly sourceFor: (node: TSESTree.Node) => string;
}

type VisitorKeys = ReturnType<typeof parseForESLint>["visitorKeys"];

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const isAstNode = (value: unknown): value is TSESTree.Node =>
    isRecord(value) && typeof value["type"] === "string";

const attachParentPointer = (
    candidate: unknown,
    parent: TSESTree.Node,
    visitorKeys: VisitorKeys,
    seen: WeakSet<object>
): void => {
    if (!isAstNode(candidate)) {
        return;
    }

    Object.defineProperty(candidate, "parent", {
        configurable: true,
        enumerable: false,
        value: parent,
        writable: true,
    });
    attachParentPointers(candidate, visitorKeys, seen);
};

const attachParentPointers = (
    node: TSESTree.Node,
    visitorKeys: VisitorKeys,
    seen: WeakSet<object>
): void => {
    if (seen.has(node)) {
        return;
    }

    seen.add(node);

    const nodeRecord = node as unknown as Readonly<Record<string, unknown>>;
    const childKeys = visitorKeys[node.type] ?? [];

    for (const childKey of childKeys) {
        const value = nodeRecord[childKey];
        const candidates = Array.isArray(value) ? value : [value];

        for (const candidate of candidates) {
            attachParentPointer(candidate, node, visitorKeys, seen);
        }
    }
};

const parseFixture = (source: string): ParsedFixture => {
    const result = parseForESLint(source, {
        comment: true,
        ecmaVersion: "latest",
        loc: true,
        range: true,
        sourceType: "module",
        tokens: true,
    });

    attachParentPointers(result.ast, result.visitorKeys, new WeakSet<object>());

    const callExpressions: TSESTree.CallExpression[] = [];

    visitDescendants(result.ast, (node) => {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            callExpressions.push(node);
        }
    });

    const sourceFor = (node: TSESTree.Node): string =>
        source.slice(node.range[0], node.range[1]);

    return {
        call(callSource): TSESTree.CallExpression {
            const matches = callExpressions.filter(
                (node) => sourceFor(node) === callSource
            );

            if (matches.length !== 1 || matches[0] === undefined) {
                throw new Error(
                    `Expected exactly one call '${callSource}', found ${String(matches.length)}.`
                );
            }

            return matches[0];
        },
        program: result.ast,
        sourceFor,
    };
};

const getCallback = (
    fixture: ParsedFixture,
    callSource: string
): TestCallback => {
    const testCall = getTestCall(fixture.call(callSource));

    if (testCall === undefined) {
        throw new Error(`Expected '${callSource}' to be an executable test.`);
    }

    return testCall.callback;
};

const getOnlyIdentifierExpression = (
    fixture: ParsedFixture
): TSESTree.Identifier => {
    const statement = fixture.program.body[0];

    if (
        statement?.type !== AST_NODE_TYPES.ExpressionStatement ||
        statement.expression.type !== AST_NODE_TYPES.Identifier
    ) {
        throw new TypeError("Expected a fixture identifier expression.");
    }

    return statement.expression;
};

describe("test AST helpers", () => {
    it("classifies executable, focused, disabled, and suite calls", () => {
        expect.hasAssertions();

        const fixture = parseFixture(`
test("runs normally", () => {});
it(dynamicTitle, function () {});
test("missing callback", callback);
test.skip("skipped", () => {});
test["todo"]("planned");
test.skip.each("nested skipped", () => {});
describe("suite", () => {});
describe["skip"]("disabled suite", () => {});
fit("legacy focus", () => {});
fdescribe("legacy focused suite", () => {});
test.each.only("focused table", () => {});
test.only.each("nested focused table", () => {});
xit("legacy disabled test", () => {});
xtest("legacy disabled test alias", () => {});
xdescribe("legacy disabled suite", () => {});
runner.only("unrelated", () => {});
        `);

        const normalTest = fixture.call('test("runs normally", () => {})');
        const dynamicTitleTest = fixture.call(
            "it(dynamicTitle, function () {})"
        );
        const focusedTable = fixture.call(
            'test.each.only("focused table", () => {})'
        );
        const dynamicTestCall = getTestCall(dynamicTitleTest);

        expect(getTestCall(normalTest)).toMatchObject({
            callback: expect.objectContaining({
                type: AST_NODE_TYPES.ArrowFunctionExpression,
            }),
            node: normalTest,
            title: "runs normally",
        });
        expect(dynamicTestCall).toMatchObject({
            callback: expect.objectContaining({
                type: AST_NODE_TYPES.FunctionExpression,
            }),
            node: dynamicTitleTest,
        });
        expect(dynamicTestCall?.title).toBeUndefined();
        expect(
            getTestCall(fixture.call('test("missing callback", callback)'))
        ).toBeUndefined();
        expect(
            getTestCall(fixture.call('test.skip("skipped", () => {})'))
        ).toBeUndefined();
        expect(getTestCall(focusedTable)?.title).toBe("focused table");

        expect(
            isTestSuiteCall(fixture.call('describe("suite", () => {})'))
        ).toBe(true);
        expect(
            isTestSuiteCall(
                fixture.call('describe["skip"]("disabled suite", () => {})')
            )
        ).toBe(false);
        expect(isTestSuiteCall(normalTest)).toBe(false);

        expect([
            isFocusedTestLikeCall(
                fixture.call('fit("legacy focus", () => {})')
            ),
            isFocusedTestLikeCall(
                fixture.call('fdescribe("legacy focused suite", () => {})')
            ),
            isFocusedTestLikeCall(focusedTable),
            isFocusedTestLikeCall(
                fixture.call('test.only.each("nested focused table", () => {})')
            ),
            isFocusedTestLikeCall(
                fixture.call('runner.only("unrelated", () => {})')
            ),
            isFocusedTestLikeCall(normalTest),
        ]).toStrictEqual([
            true,
            true,
            true,
            true,
            false,
            false,
        ]);

        expect([
            isDisabledTestLikeCall(
                fixture.call('test.skip("skipped", () => {})')
            ),
            isDisabledTestLikeCall(fixture.call('test["todo"]("planned")')),
            isDisabledTestLikeCall(
                fixture.call('test.skip.each("nested skipped", () => {})')
            ),
            isDisabledTestLikeCall(
                fixture.call('describe["skip"]("disabled suite", () => {})')
            ),
            isDisabledTestLikeCall(
                fixture.call('runner.only("unrelated", () => {})')
            ),
            isDisabledTestLikeCall(
                fixture.call('xit("legacy disabled test", () => {})')
            ),
            isDisabledTestLikeCall(
                fixture.call('xtest("legacy disabled test alias", () => {})')
            ),
            isDisabledTestLikeCall(
                fixture.call('xdescribe("legacy disabled suite", () => {})')
            ),
            isDisabledTestLikeCall(normalTest),
        ]).toStrictEqual([
            true,
            true,
            true,
            true,
            false,
            true,
            true,
            true,
            false,
        ]);
    });

    it("ignores AST-like traversal metadata and non-node array values", () => {
        expect.hasAssertions();

        const keptChild = getOnlyIdentifierExpression(
            parseFixture("keptChild;")
        );
        const commentsSentinel = getOnlyIdentifierExpression(
            parseFixture("commentsSentinel;")
        );
        const locationSentinel = getOnlyIdentifierExpression(
            parseFixture("locationSentinel;")
        );
        const parentSentinel = getOnlyIdentifierExpression(
            parseFixture("parentSentinel;")
        );
        const rangeSentinel = getOnlyIdentifierExpression(
            parseFixture("rangeSentinel;")
        );
        const tokensSentinel = getOnlyIdentifierExpression(
            parseFixture("tokensSentinel;")
        );
        // The traversal contract deliberately accepts parser-owned nodes with
        // unknown enumerable fields, including non-node array values.
        const syntheticRoot = {
            child: keptChild,
            comments: [commentsSentinel],
            extraChildren: [
                null,
                "not a node",
                keptChild,
            ],
            loc: locationSentinel,
            name: "syntheticRoot",
            parent: parentSentinel,
            range: rangeSentinel,
            tokens: [tokensSentinel],
            type: AST_NODE_TYPES.Identifier,
        } as unknown as TSESTree.Node;
        const visited: TSESTree.Node[] = [];

        visitDescendants(syntheticRoot, (node) => {
            visited.push(node);
        });

        expect(visited).toStrictEqual([syntheticRoot, keptChild]);
    });

    it("traverses all descendants without following parent metadata cycles", () => {
        expect.hasAssertions();

        const fixture = parseFixture(`
test("outer", () => {
    record(directValue);
    const nestedArrow = () => expect(nestedArrowValue).toBe(true);

    function nestedFunction(nestedParameter) {
        expect(nestedFunctionValue).toBe(nestedParameter);
    }
});
        `);
        const callback = getCallback(
            fixture,
            'test("outer", () => {\n    record(directValue);\n    const nestedArrow = () => expect(nestedArrowValue).toBe(true);\n\n    function nestedFunction(nestedParameter) {\n        expect(nestedFunctionValue).toBe(nestedParameter);\n    }\n})'
        );
        const allNodes: TSESTree.Node[] = [];
        const outsideNestedFunctions: TSESTree.Node[] = [];

        visitDescendants(callback.body, (node) => {
            allNodes.push(node);
        });
        visitDescendantsOutsideNestedFunctions(callback.body, (node) => {
            outsideNestedFunctions.push(node);
        });

        expect(allNodes[0]).toBe(callback.body);
        expect(new Set(allNodes).size).toBe(allNodes.length);
        expect(
            new Set(
                allNodes
                    .filter(
                        (node): node is TSESTree.Identifier =>
                            node.type === AST_NODE_TYPES.Identifier
                    )
                    .map((node) => node.name)
            )
        ).toStrictEqual(
            new Set([
                "directValue",
                "expect",
                "nestedArrow",
                "nestedArrowValue",
                "nestedFunction",
                "nestedFunctionValue",
                "nestedParameter",
                "record",
                "toBe",
            ])
        );
        expect(
            new Set(
                outsideNestedFunctions
                    .filter(
                        (node): node is TSESTree.Identifier =>
                            node.type === AST_NODE_TYPES.Identifier
                    )
                    .map((node) => node.name)
            )
        ).toStrictEqual(
            new Set([
                "directValue",
                "nestedArrow",
                "record",
            ])
        );
        expect(
            outsideNestedFunctions.filter(
                (node) =>
                    node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
                    node.type === AST_NODE_TYPES.FunctionDeclaration
            )
        ).toHaveLength(2);
    });

    it("finds only direct expect-like calls outside nested callbacks", () => {
        expect.hasAssertions();

        const directFixture = parseFixture(`
test("direct", () => {
    expect.soft(value).toBe(expected);
    later(() => expect(nested).toBe(expected));
});
        `);
        const nestedOnlyFixture = parseFixture(`
test("nested only", () => {
    later(() => expect(nested).toBe(expected));
});
        `);
        const directCallback = getCallback(
            directFixture,
            'test("direct", () => {\n    expect.soft(value).toBe(expected);\n    later(() => expect(nested).toBe(expected));\n})'
        );
        const nestedOnlyCallback = getCallback(
            nestedOnlyFixture,
            'test("nested only", () => {\n    later(() => expect(nested).toBe(expected));\n})'
        );

        expect(
            containsExpectCallOutsideNestedFunctions(directCallback.body)
        ).toBe(true);
        expect(
            containsExpectCallOutsideNestedFunctions(nestedOnlyCallback.body)
        ).toBe(false);
        expect(isExpectLikeCall(directFixture.call("expect.soft(value)"))).toBe(
            true
        );
        expect(isExpectLikeCall(directFixture.call("expect(nested)"))).toBe(
            true
        );
        expect(
            isExpectLikeCall(
                directFixture.call("later(() => expect(nested).toBe(expected))")
            )
        ).toBe(false);
    });

    it("enters directly invoked function literals but skips deferred callbacks", () => {
        expect.hasAssertions();

        const fixture = parseFixture(`
test("function boundaries", () => {
    (() => expect(arrowValue).toBe(true))();
    (function () {
        expect(functionValue).toBe(true);
    })();
    ((() => expect(assertedValue).toBe(true)) as () => void)();
    later(() => expect(deferredValue).toBe(true));
});
        `);
        const callback = getCallback(
            fixture,
            'test("function boundaries", () => {\n    (() => expect(arrowValue).toBe(true))();\n    (function () {\n        expect(functionValue).toBe(true);\n    })();\n    ((() => expect(assertedValue).toBe(true)) as () => void)();\n    later(() => expect(deferredValue).toBe(true));\n})'
        );
        const visitedExpectCalls = new Set<string>();

        visitDescendantsOutsideNestedFunctions(callback.body, (node) => {
            if (
                node.type === AST_NODE_TYPES.CallExpression &&
                isExpectLikeCall(node)
            ) {
                visitedExpectCalls.add(fixture.sourceFor(node));
            }
        });

        expect(visitedExpectCalls).toStrictEqual(
            new Set([
                "expect(arrowValue)",
                "expect(assertedValue)",
                "expect(functionValue)",
            ])
        );
    });

    it("resolves matcher calls and assertion-chain modifiers", () => {
        expect.hasAssertions();

        const fixture = parseFixture(`
expect(actual).not.toEqual(expected);
expect(promise).rejects.toThrow("failure");
expect(value)["toBe"](expected);
expect(notModifier).not();
expect(resolvesModifier).resolves();
expect(rejectsModifier).rejects();
actual.toBe(expected);
wrap(expect(hidden)).toBe(expected);
        `);
        const notAssertion = fixture.call(
            "expect(actual).not.toEqual(expected)"
        );
        const rejectsAssertion = fixture.call(
            'expect(promise).rejects.toThrow("failure")'
        );
        const computedAssertion = fixture.call(
            'expect(value)["toBe"](expected)'
        );
        const notRoot = fixture.call("expect(actual)");
        const resolvedNotAssertion = getAssertionMatcherCall(notAssertion);
        const resolvedComputedAssertion =
            getAssertionMatcherCall(computedAssertion);

        expect(resolvedNotAssertion).toMatchObject({
            expectCall: notRoot,
            matcherCall: notAssertion,
            matcherName: "toEqual",
        });
        expect(resolvedComputedAssertion).toMatchObject({
            expectCall: fixture.call("expect(value)"),
            matcherCall: computedAssertion,
            matcherName: "toBe",
        });
        expect(
            getAssertionMatcherCall(fixture.call("actual.toBe(expected)"))
        ).toBeUndefined();
        expect(
            getAssertionMatcherCall(
                fixture.call("wrap(expect(hidden)).toBe(expected)")
            )
        ).toBeUndefined();
        expect(getAssertionMatcherCall(notRoot)).toBeUndefined();
        expect(
            getAssertionMatcherCall(fixture.call("expect(notModifier).not()"))
        ).toBeUndefined();
        expect(
            getAssertionMatcherCall(
                fixture.call("expect(resolvesModifier).resolves()")
            )
        ).toBeUndefined();
        expect(
            getAssertionMatcherCall(
                fixture.call("expect(rejectsModifier).rejects()")
            )
        ).toBeUndefined();

        expect(assertionChainHasProperty(notRoot, new Set(["not"]))).toBe(true);
        expect(assertionChainHasProperty(notRoot, new Set(["rejects"]))).toBe(
            false
        );
        expect(
            assertionChainHasProperty(
                fixture.call("expect(promise)"),
                new Set(["rejects"])
            )
        ).toBe(true);
        expect(
            assertionChainHasProperty(
                fixture.call("expect(promise)"),
                new Set(["resolves"])
            )
        ).toBe(false);
        expect(getAssertionMatcherCall(rejectsAssertion)?.matcherName).toBe(
            "toThrow"
        );
    });

    it("summarizes assertion kinds and async handling without nested callbacks", () => {
        expect.hasAssertions();

        const fixture = parseFixture(`
test("signals", async () => {
    await expect(load()).rejects.toThrow("failure");
    expect(send).toHaveBeenCalledTimes(1);
    expect(render()).toMatchSnapshot();
    expect(value).not.toBeNull();
    expect(value).toBe("ok");
    expect(load()).resolves.toEqual({ ok: true });
    later(() => expect(nested).toThrow("not part of this test body"));
});
test("returned", () => {
    return expect(load()).resolves.toEqual({ ok: true });
});
        `);
        const signalSummary = summarizeAssertions(
            getCallback(
                fixture,
                'test("signals", async () => {\n    await expect(load()).rejects.toThrow("failure");\n    expect(send).toHaveBeenCalledTimes(1);\n    expect(render()).toMatchSnapshot();\n    expect(value).not.toBeNull();\n    expect(value).toBe("ok");\n    expect(load()).resolves.toEqual({ ok: true });\n    later(() => expect(nested).toThrow("not part of this test body"));\n})'
            )
        );
        const returnedSummary = summarizeAssertions(
            getCallback(
                fixture,
                'test("returned", () => {\n    return expect(load()).resolves.toEqual({ ok: true });\n})'
            )
        );

        expect(signalSummary).toMatchObject({
            assertionCount: 6,
            mockCallAssertionCount: 1,
            negativeSignalCount: 2,
            snapshotAssertionCount: 1,
        });
        expect(signalSummary.unawaitedAsyncAssertionNodes).toHaveLength(1);
        expect(
            fixture.sourceFor(signalSummary.unawaitedAsyncAssertionNodes[0]!)
        ).toBe("expect(load())");
        expect(returnedSummary).toMatchObject({
            assertionCount: 1,
            mockCallAssertionCount: 0,
            negativeSignalCount: 0,
            snapshotAssertionCount: 0,
            unawaitedAsyncAssertionNodes: [],
        });
    });

    it.each([
        "denies access",
        "reports an error",
        "fails closed",
        "handles failure",
        "rejects invalid input",
        "handles a missing value",
        "covers the negative case",
        "reject token",
        "throws on corruption",
        "works without credentials",
    ])("recognizes negative title signal: %s", (title) => {
        expect.hasAssertions();
        expect(titleHasNegativeSignal(title)).toBe(true);
    });

    it.each([
        undefined,
        "successful result",
        "errorCode",
        "failureMode",
    ])("rejects absent or non-word negative title signal: %s", (title) => {
        expect.hasAssertions();
        expect(titleHasNegativeSignal(title)).toBe(false);
    });
});
