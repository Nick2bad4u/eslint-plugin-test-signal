/**
 * @packageDocumentation
 * AST utilities for recognizing common JavaScript and TypeScript test shapes.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/** Names of supported test-case functions. */
const testCaseFunctionNames = new Set(["it", "test"]);
/** Names of supported test-suite functions. */
const testSuiteFunctionNames = new Set(["describe"]);
/** Legacy focused aliases used by Jest/Vitest-style test frameworks. */
const focusedTestFunctionNames = new Set(["fdescribe", "fit"]);
/** Modifiers that focus a test or suite and hide surrounding coverage. */
const focusedTestModifiers = new Set(["only"]);
/** Legacy disabled aliases used by Jest/Vitest-style test frameworks. */
const disabledTestFunctionNames = new Set(["xdescribe", "xit", "xtest"]);
/** Modifiers that should not be linted as executable test bodies. */
const skippedTestModifiers = new Set(["skip", "todo"]);
/** Assertion method names that only check mock invocation wiring. */
const mockCallAssertionNames = new Set([
    "toBeCalled",
    "toBeCalledTimes",
    "toHaveBeenCalled",
    "toHaveBeenCalledBefore",
    "toHaveBeenCalledOnce",
    "toHaveBeenCalledTimes",
    "toHaveBeenCalledWith",
    "toHaveBeenLastCalledWith",
    "toHaveBeenNthCalledWith",
    "toHaveLastReturnedWith",
    "toHaveNthReturnedWith",
    "toHaveReturned",
    "toHaveReturnedTimes",
    "toHaveReturnedWith",
]);
/** Assertion method names that encode failure-path coverage. */
const negativeAssertionNames = new Set([
    "toBeFalsy",
    "toBeNull",
    "toBeUndefined",
    "toEqualTypeOf",
    "toHaveProperty",
    "toMatchObject",
    "toReject",
    "toRejectWith",
    "toThrow",
    "toThrowError",
    "toThrowErrorMatchingInlineSnapshot",
    "toThrowErrorMatchingSnapshot",
]);
/** Snapshot assertion names handled by snapshot-only coverage detection. */
const snapshotAssertionNames = new Set([
    "toMatchFileSnapshot",
    "toMatchInlineSnapshot",
    "toMatchSnapshot",
    "toThrowErrorMatchingInlineSnapshot",
    "toThrowErrorMatchingSnapshot",
]);
/** Test titles that usually indicate explicit negative-path coverage. */
const negativeTitlePattern =
    /\b(?:denies|error|fail(?:s|ure)?|invalid|missing|negative|rejects?|throws?|without)\b/iv;

const notPropertyNames = new Set(["not"]);
const promiseModifierNames = new Set(["rejects", "resolves"]);
const rejectsPropertyNames = new Set(["rejects"]);

/** Resolved matcher call in an `expect(...)` assertion chain. */
export type AssertionMatcherCall = Readonly<{
    expectCall: TSESTree.CallExpression;
    matcherCall: TSESTree.CallExpression;
    matcherName: string;
}>;

/** Collected assertion signal for one test body. */
export type AssertionSummary = Readonly<{
    assertionCount: number;
    mockCallAssertionCount: number;
    negativeSignalCount: number;
    snapshotAssertionCount: number;
    unawaitedAsyncAssertionNodes: readonly TSESTree.CallExpression[];
}>;

/** Recognized test call metadata. */
export type TestCall = Readonly<{
    callback: TestCallback;
    node: TSESTree.CallExpression;
    title: string | undefined;
}>;

/** Minimal callback node type accepted by test analysis helpers. */
export type TestCallback =
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionExpression;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const isAstNode = (value: unknown): value is TSESTree.Node =>
    isRecord(value) && typeof value["type"] === "string";

const getPropertyName = (
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

const getCalleeBaseName = (
    callee: TSESTree.CallExpression["callee"]
): string | undefined => {
    if (callee.type === AST_NODE_TYPES.Identifier) {
        return callee.name;
    }

    if (callee.type !== AST_NODE_TYPES.MemberExpression) {
        return undefined;
    }

    let current: TSESTree.Expression = callee.object;

    while (current.type === AST_NODE_TYPES.MemberExpression) {
        current = current.object;
    }

    return current.type === AST_NODE_TYPES.Identifier
        ? current.name
        : undefined;
};

const hasSkippedModifier = (
    callee: TSESTree.CallExpression["callee"]
): boolean => {
    if (callee.type !== AST_NODE_TYPES.MemberExpression) {
        return false;
    }

    const propertyName = getPropertyName(callee.property);

    if (propertyName !== undefined && skippedTestModifiers.has(propertyName)) {
        return true;
    }

    const object = callee.object;

    return object.type === AST_NODE_TYPES.MemberExpression
        ? hasSkippedModifier(object)
        : false;
};

const hasFocusedModifier = (
    callee: TSESTree.CallExpression["callee"]
): boolean => {
    if (callee.type !== AST_NODE_TYPES.MemberExpression) {
        return false;
    }

    const propertyName = getPropertyName(callee.property);

    if (propertyName !== undefined && focusedTestModifiers.has(propertyName)) {
        return true;
    }

    const object = callee.object;

    return object.type === AST_NODE_TYPES.MemberExpression
        ? hasFocusedModifier(object)
        : false;
};

const getStringLiteralValue = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects.
    node: TSESTree.CallExpressionArgument | undefined
): string | undefined => {
    if (node?.type !== AST_NODE_TYPES.Literal) {
        return undefined;
    }

    return typeof node.value === "string" ? node.value : undefined;
};

const getTestCallback = (
    node: TSESTree.CallExpression
): TestCallback | undefined => {
    const callback = node.arguments.at(1);

    if (
        callback?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        callback?.type === AST_NODE_TYPES.FunctionExpression
    ) {
        return callback;
    }

    return undefined;
};

const isNamedCall = (
    node: TSESTree.CallExpression,
    names: ReadonlySet<string>
): boolean => {
    const baseName = getCalleeBaseName(node.callee);

    return (
        baseName !== undefined &&
        names.has(baseName) &&
        !hasSkippedModifier(node.callee)
    );
};

/**
 * Resolve metadata when a call expression is an executable test case.
 */
export const getTestCall = (
    node: TSESTree.CallExpression
): TestCall | undefined => {
    if (!isNamedCall(node, testCaseFunctionNames)) {
        return undefined;
    }

    const callback = getTestCallback(node);

    if (callback === undefined) {
        return undefined;
    }

    return {
        callback,
        node,
        title: getStringLiteralValue(node.arguments.at(0)),
    };
};

/**
 * Check whether a call expression opens an executable test suite.
 */
export const isTestSuiteCall = (node: TSESTree.CallExpression): boolean =>
    isNamedCall(node, testSuiteFunctionNames);

/**
 * Check whether a call expression is a focused test or suite.
 */
export const isFocusedTestLikeCall = (
    node: TSESTree.CallExpression
): boolean => {
    const baseName = getCalleeBaseName(node.callee);

    if (baseName === undefined) {
        return false;
    }

    return (
        focusedTestFunctionNames.has(baseName) ||
        ((testCaseFunctionNames.has(baseName) ||
            testSuiteFunctionNames.has(baseName)) &&
            hasFocusedModifier(node.callee))
    );
};

/**
 * Check whether a call expression is a disabled test or suite.
 */
export const isDisabledTestLikeCall = (
    node: TSESTree.CallExpression
): boolean => {
    const baseName = getCalleeBaseName(node.callee);

    if (baseName === undefined) {
        return false;
    }

    return (
        disabledTestFunctionNames.has(baseName) ||
        ((testCaseFunctionNames.has(baseName) ||
            testSuiteFunctionNames.has(baseName)) &&
            hasSkippedModifier(node.callee))
    );
};

const visitNode = (
    node: TSESTree.Node,
    visitor: (child: TSESTree.Node) => void,
    seen: WeakSet<object>
): void => {
    if (seen.has(node)) {
        return;
    }

    seen.add(node);
    visitor(node);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESTree nodes are traversed through their enumerable child fields.
    const nodeRecord = node as unknown as Readonly<Record<string, unknown>>;

    for (const [key, value] of Object.entries(nodeRecord)) {
        if (
            key === "parent" ||
            key === "tokens" ||
            key === "comments" ||
            key === "loc" ||
            key === "range"
        ) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (isAstNode(item)) {
                    visitNode(item, visitor, seen);
                }
            }

            continue;
        }

        if (isAstNode(value)) {
            visitNode(value, visitor, seen);
        }
    }
};

/**
 * Visit every descendant node under a starting AST node.
 */
export const visitDescendants = (
    node: TSESTree.Node,
    visitor: (child: TSESTree.Node) => void
): void => {
    visitNode(node, visitor, new WeakSet<object>());
};

/**
 * Check whether a call expression is the root `expect(...)` call in an
 * assertion chain.
 */
export const isExpectCall = (node: TSESTree.CallExpression): boolean =>
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === "expect";

const findExpectCallInAssertionChain = (
    node: TSESTree.Node
): TSESTree.CallExpression | undefined => {
    if (node.type === AST_NODE_TYPES.CallExpression) {
        if (isExpectCall(node)) {
            return node;
        }

        return node.callee.type === AST_NODE_TYPES.MemberExpression ||
            node.callee.type === AST_NODE_TYPES.ChainExpression
            ? findExpectCallInAssertionChain(node.callee)
            : undefined;
    }

    if (node.type === AST_NODE_TYPES.MemberExpression) {
        return findExpectCallInAssertionChain(node.object);
    }

    if (node.type === AST_NODE_TYPES.ChainExpression) {
        return findExpectCallInAssertionChain(node.expression);
    }

    return undefined;
};

/**
 * Resolve the terminal matcher call for an `expect(...)` assertion chain.
 */
export const getAssertionMatcherCall = (
    node: TSESTree.CallExpression
): AssertionMatcherCall | undefined => {
    if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
        return undefined;
    }

    const matcherName = getPropertyName(node.callee.property);

    if (
        matcherName === undefined ||
        matcherName === "not" ||
        matcherName === "resolves" ||
        matcherName === "rejects"
    ) {
        return undefined;
    }

    const expectCall = findExpectCallInAssertionChain(node.callee.object);

    return expectCall === undefined
        ? undefined
        : {
              expectCall,
              matcherCall: node,
              matcherName,
          };
};

const getAssertionMethodName = (
    node: TSESTree.CallExpression
): string | undefined => {
    let current: TSESTree.Node = node;

    while (isRecord(current)) {
        const parent: unknown = current.parent;

        if (!isAstNode(parent)) {
            return undefined;
        }

        if (
            parent.type === AST_NODE_TYPES.MemberExpression &&
            parent.object === current
        ) {
            const propertyName = getPropertyName(parent.property);

            if (
                propertyName !== undefined &&
                propertyName !== "not" &&
                propertyName !== "resolves" &&
                propertyName !== "rejects"
            ) {
                return propertyName;
            }
        }

        if (
            parent.type !== AST_NODE_TYPES.MemberExpression &&
            parent.type !== AST_NODE_TYPES.CallExpression &&
            parent.type !== AST_NODE_TYPES.ChainExpression
        ) {
            return undefined;
        }

        current = parent;
    }

    return undefined;
};

/**
 * Check whether an `expect(...)` assertion chain contains one of the requested
 * modifier properties.
 */
export const assertionChainHasProperty = (
    node: TSESTree.CallExpression,
    propertyNames: ReadonlySet<string>
): boolean => {
    let current: TSESTree.Node = node;

    while (isRecord(current)) {
        const parent: unknown = current.parent;

        if (!isAstNode(parent)) {
            return false;
        }

        if (
            parent.type === AST_NODE_TYPES.MemberExpression &&
            parent.object === current
        ) {
            const propertyName = getPropertyName(parent.property);

            if (
                propertyName !== undefined &&
                propertyNames.has(propertyName)
            ) {
                return true;
            }
        }

        if (
            parent.type !== AST_NODE_TYPES.MemberExpression &&
            parent.type !== AST_NODE_TYPES.CallExpression &&
            parent.type !== AST_NODE_TYPES.ChainExpression
        ) {
            return false;
        }

        current = parent;
    }

    return false;
};

const getTopmostAssertionExpression = (
    node: TSESTree.CallExpression
): TSESTree.Node => {
    let current: TSESTree.Node = node;

    while (isRecord(current)) {
        const parent: unknown = current.parent;

        if (
            !isAstNode(parent) ||
            (parent.type !== AST_NODE_TYPES.MemberExpression &&
                parent.type !== AST_NODE_TYPES.CallExpression &&
                parent.type !== AST_NODE_TYPES.ChainExpression)
        ) {
            return current;
        }

        current = parent;
    }

    return current;
};

const isAwaitedOrReturned = (node: TSESTree.Node): boolean => {
    let current: TSESTree.Node = node;

    while (isRecord(current)) {
        const parent = current.parent;

        if (!isAstNode(parent)) {
            return false;
        }

        if (
            parent.type === AST_NODE_TYPES.AwaitExpression ||
            parent.type === AST_NODE_TYPES.ReturnStatement
        ) {
            return true;
        }

        if (
            parent.type === AST_NODE_TYPES.ExpressionStatement ||
            parent.type === AST_NODE_TYPES.BlockStatement
        ) {
            return false;
        }

        current = parent;
    }

    return false;
};

/**
 * Collect high-level assertion signals for one test callback.
 */
export const summarizeAssertions = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESTree node types are supplied by typescript-eslint as mutable parser objects.
    callback: TestCallback
): AssertionSummary => {
    let assertionCount = 0;
    let mockCallAssertionCount = 0;
    let negativeSignalCount = 0;
    let snapshotAssertionCount = 0;
    const unawaitedAsyncAssertionNodes: TSESTree.CallExpression[] = [];

    visitDescendants(callback.body, (node) => {
        if (
            node.type !== AST_NODE_TYPES.CallExpression ||
            !isExpectCall(node)
        ) {
            return;
        }

        assertionCount += 1;

        const assertionMethodName = getAssertionMethodName(node);
        const hasRejects = assertionChainHasProperty(
            node,
            rejectsPropertyNames
        );
        const hasNot = assertionChainHasProperty(node, notPropertyNames);

        if (
            assertionMethodName !== undefined &&
            mockCallAssertionNames.has(assertionMethodName)
        ) {
            mockCallAssertionCount += 1;
        }

        if (
            assertionMethodName !== undefined &&
            snapshotAssertionNames.has(assertionMethodName)
        ) {
            snapshotAssertionCount += 1;
        }

        if (
            hasRejects ||
            hasNot ||
            (assertionMethodName !== undefined &&
                negativeAssertionNames.has(assertionMethodName))
        ) {
            negativeSignalCount += 1;
        }

        if (
            assertionChainHasProperty(node, promiseModifierNames) &&
            !isAwaitedOrReturned(getTopmostAssertionExpression(node))
        ) {
            unawaitedAsyncAssertionNodes.push(node);
        }
    });

    return {
        assertionCount,
        mockCallAssertionCount,
        negativeSignalCount,
        snapshotAssertionCount,
        unawaitedAsyncAssertionNodes,
    };
};

/**
 * Check whether a test title gives a clear negative-path signal.
 */
export const titleHasNegativeSignal = (title: string | undefined): boolean =>
    title === undefined ? false : negativeTitlePattern.test(title);
