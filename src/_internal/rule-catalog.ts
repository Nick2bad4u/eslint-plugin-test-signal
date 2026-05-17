/**
 * @packageDocumentation
 * Stable catalog IDs for all plugin rules.
 */
import { objectFromEntries, setHas } from "ts-extras";

/**
 * Catalog metadata for a single rule.
 */
export type TestSignalRuleCatalogEntry = Readonly<{
    ruleId: TestSignalRuleCatalogId;
    ruleName: TestSignalRuleNamePattern;
    ruleNumber: number;
}>;

/**
 * Stable machine-friendly rule id format.
 */
export type TestSignalRuleCatalogId = `R${string}`;

/* eslint-disable perfectionist/sort-union-types -- Keep this in stable catalog order so existing rule IDs never change. */
/** Pattern for unqualified rule names supported by eslint-plugin-test-signal. */
export type TestSignalRuleNamePattern =
    | "no-empty-async-tests"
    | "no-mock-call-only-tests"
    | "no-snapshot-only-tests"
    | "require-awaited-async-assertions"
    | "require-negative-path"
    | "no-focused-tests"
    | "no-disabled-tests"
    | "require-assertions"
    | "no-conditional-assertions"
    | "no-try-catch-assertions"
    | "no-weak-truthy-assertions"
    | "require-error-message-assertions"
    | "no-async-foreach-assertions"
    | "no-assertions-in-hooks"
    | "no-constant-assertions"
    | "no-weak-existence-assertions"
    | "no-identical-expected-actual"
    | "no-weak-asymmetric-assertions"
    | "no-tautological-length-assertions"
    | "no-fixed-delay-tests"
    | "no-synthetic-promise-assertions"
    | "no-vacuous-string-assertions"
    | "no-vacuous-numeric-assertions"
    | "no-broad-object-key-count-assertions"
    | "no-duplicate-assertions";
/* eslint-enable perfectionist/sort-union-types -- Resume regular union ordering outside the stable catalog list. */

/**
 * Stable global ordering used for rule catalog IDs.
 *
 * @remarks
 * Append new rules to preserve existing IDs.
 */
/* eslint-disable perfectionist/sort-arrays -- Keep this in stable catalog order so existing rule IDs never change. */
const orderedRuleNames = [
    "no-empty-async-tests",
    "no-mock-call-only-tests",
    "no-snapshot-only-tests",
    "require-awaited-async-assertions",
    "require-negative-path",
    "no-focused-tests",
    "no-disabled-tests",
    "require-assertions",
    "no-conditional-assertions",
    "no-try-catch-assertions",
    "no-weak-truthy-assertions",
    "require-error-message-assertions",
    "no-async-foreach-assertions",
    "no-assertions-in-hooks",
    "no-constant-assertions",
    "no-weak-existence-assertions",
    "no-identical-expected-actual",
    "no-weak-asymmetric-assertions",
    "no-tautological-length-assertions",
    "no-fixed-delay-tests",
    "no-synthetic-promise-assertions",
    "no-vacuous-string-assertions",
    "no-vacuous-numeric-assertions",
    "no-broad-object-key-count-assertions",
    "no-duplicate-assertions",
] as const satisfies readonly TestSignalRuleNamePattern[];
/* eslint-enable perfectionist/sort-arrays -- Resume regular array ordering outside the stable catalog list. */

const orderedRuleNameSet: ReadonlySet<string> = new Set(orderedRuleNames);

const toRuleCatalogId = (ruleNumber: number): TestSignalRuleCatalogId =>
    `R${String(ruleNumber).padStart(3, "0")}`;

const isTestSignalRuleNamePattern = (
    ruleName: string
): ruleName is TestSignalRuleNamePattern =>
    setHas(orderedRuleNameSet, ruleName);

/**
 * Canonical catalog metadata entries in stable display/order form.
 */
export const testSignalRuleCatalogEntries: readonly TestSignalRuleCatalogEntry[] =
    orderedRuleNames.map((ruleName, index) => {
        const ruleNumber = index + 1;

        return {
            ruleId: toRuleCatalogId(ruleNumber),
            ruleName,
            ruleNumber,
        };
    });

/**
 * Fast lookup map for rule catalog metadata by rule name.
 */
export const testSignalRuleCatalogByRuleName: Readonly<
    Partial<Record<TestSignalRuleNamePattern, TestSignalRuleCatalogEntry>>
> = objectFromEntries(
    testSignalRuleCatalogEntries.map((entry) => [entry.ruleName, entry])
);

/**
 * Resolve stable catalog metadata for a rule name when available.
 */
export const getRuleCatalogEntryForRuleNameOrNull = (
    ruleName: string
): null | TestSignalRuleCatalogEntry => {
    if (!isTestSignalRuleNamePattern(ruleName)) {
        return null;
    }

    return testSignalRuleCatalogByRuleName[ruleName] ?? null;
};

/**
 * Resolve stable catalog metadata for a rule name.
 *
 * @throws When the rule is missing from the catalog.
 */
export const getRuleCatalogEntryForRuleName = (
    ruleName: string
): TestSignalRuleCatalogEntry => {
    const catalogEntry = getRuleCatalogEntryForRuleNameOrNull(ruleName);

    if (catalogEntry === null) {
        throw new TypeError(
            `Rule '${ruleName}' is missing from the stable rule catalog.`
        );
    }

    return catalogEntry;
};

/**
 * Resolve stable catalog metadata by rule id.
 */
export const testSignalRuleCatalogByRuleId: ReadonlyMap<
    TestSignalRuleCatalogId,
    TestSignalRuleCatalogEntry
> = new Map(testSignalRuleCatalogEntries.map((entry) => [entry.ruleId, entry]));

/**
 * Resolve stable catalog metadata for a catalog id.
 */
export const getRuleCatalogEntryForRuleId = (
    ruleId: TestSignalRuleCatalogId
): TestSignalRuleCatalogEntry | undefined =>
    testSignalRuleCatalogByRuleId.get(ruleId);

/**
 * Validate that catalog IDs are unique and sequential.
 */
export const validateRuleCatalogIntegrity = (): boolean => {
    const seenRuleIds = new Set<TestSignalRuleCatalogId>();

    for (const [index, entry] of testSignalRuleCatalogEntries.entries()) {
        if (setHas(seenRuleIds, entry.ruleId)) {
            return false;
        }

        seenRuleIds.add(entry.ruleId);

        const expectedRuleNumber = index + 1;
        if (entry.ruleNumber !== expectedRuleNumber) {
            return false;
        }

        if (entry.ruleId !== toRuleCatalogId(expectedRuleNumber)) {
            return false;
        }
    }

    return true;
};
