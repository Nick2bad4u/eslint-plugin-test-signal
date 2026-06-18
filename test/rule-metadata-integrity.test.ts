/**
 * @packageDocumentation
 * Strong contract tests for required rule metadata across all registered rules.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { getRuleCatalogEntryForRuleName } from "../src/_internal/rule-catalog";
import { createRuleDocsUrl } from "../src/_internal/rule-docs-url";
import { isTestSignalConfigReference } from "../src/_internal/test-signal-config-references";
import testSignalPlugin from "../src/plugin";

const expectedRuleTypes = new Set([
    "layout",
    "problem",
    "suggestion",
]);
const ruleCatalogIdPattern = /^R\d{3}$/v;

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const getRuleSourceFileNames = (): readonly string[] => {
    const rulesDirectory = path.join(process.cwd(), "src", "rules");

    return fs
        .readdirSync(rulesDirectory)
        .filter((entry) => entry.endsWith(".ts"))
        .map((entry) => entry.replace(/\.ts$/v, ""))
        .toSorted((left, right) => left.localeCompare(right));
};

const normalizeTestSignalConfigReferences = (
    testSignalConfigs: unknown
): readonly string[] => {
    if (typeof testSignalConfigs === "string") {
        return [testSignalConfigs];
    }

    if (!Array.isArray(testSignalConfigs)) {
        return [];
    }

    return testSignalConfigs.filter(
        (reference): reference is string => typeof reference === "string"
    );
};

const getSortedRuleNumberValues = (
    values: ReadonlySet<number>
): readonly number[] =>
    // eslint-disable-next-line canonical/no-use-extend-native -- The local lint policy requires `toSorted` instead of mutating `sort` for this derived array.
    [...values].toSorted((left, right) => left - right);

const getExpectedRegisteredRuleNumbers = (
    ruleNames: readonly string[]
): readonly number[] =>
    ruleNames
        .map((ruleName) => getRuleCatalogEntryForRuleName(ruleName).ruleNumber)
        .toSorted((left, right) => left - right);

const getRuleRecord = (
    ruleName: string,
    ruleModule: unknown
): Readonly<Record<string, unknown>> => {
    expect(
        isRecord(ruleModule),
        `Rule '${ruleName}' must export an object`
    ).toBe(true);

    return isRecord(ruleModule) ? ruleModule : {};
};

const getRuleMetaRecord = (
    ruleName: string,
    ruleRecord: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> => {
    const meta = ruleRecord["meta"];

    expect(isRecord(meta), `Rule '${ruleName}' must define meta`).toBe(true);

    return isRecord(meta) ? meta : {};
};

const getRuleDocsRecord = (
    ruleName: string,
    metaRecord: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> => {
    const docs = metaRecord["docs"];

    expect(isRecord(docs), `Rule '${ruleName}' must define meta.docs`).toBe(
        true
    );

    return isRecord(docs) ? docs : {};
};

const assertBaseRuleMetadataContract = ({
    metaRecord,
    ruleName,
    ruleRecord,
}: Readonly<{
    metaRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
    ruleRecord: Readonly<Record<string, unknown>>;
}>): void => {
    const type = metaRecord["type"];
    const schema = metaRecord["schema"];
    const ruleNameProperty = ruleRecord["name"];

    expect(ruleNameProperty).toBe(ruleName);
    expect(
        isNonEmptyString(type) && expectedRuleTypes.has(type),
        `Rule '${ruleName}' has unsupported meta.type '${String(type)}'`
    ).toBe(true);
    expect(
        Array.isArray(schema),
        `Rule '${ruleName}' must declare a schema array`
    ).toBe(true);
};

const assertDocsContract = ({
    docsRecord,
    ruleName,
}: Readonly<{
    docsRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
}>): void => {
    const description = docsRecord["description"];
    const recommended = docsRecord["recommended"];
    const requiresTypeChecking = docsRecord["requiresTypeChecking"];
    const ruleId = docsRecord["ruleId"];
    const ruleNumber = docsRecord["ruleNumber"];
    const testSignalConfigs = docsRecord["testSignalConfigs"];
    const url = docsRecord["url"];

    expect(isNonEmptyString(description)).toBe(true);
    expect(recommended).toBeTypeOf("boolean");
    expect(requiresTypeChecking).toBeTypeOf("boolean");
    expect(
        typeof ruleId === "string" && ruleCatalogIdPattern.test(ruleId)
    ).toBe(true);
    expect(
        typeof ruleNumber === "number" &&
            Number.isInteger(ruleNumber) &&
            ruleNumber > 0
    ).toBe(true);
    expect(url).toBe(createRuleDocsUrl(ruleName));

    if (typeof ruleId === "string" && typeof ruleNumber === "number") {
        expect(ruleId).toBe(`R${String(ruleNumber).padStart(3, "0")}`);
    }

    expect(
        fs.existsSync(
            path.join(process.cwd(), "docs", "rules", `${ruleName}.md`)
        )
    ).toBe(true);

    const references = normalizeTestSignalConfigReferences(testSignalConfigs);

    expect(references.length).toBeGreaterThan(0);
    expect(references).toHaveLength(new Set(references).size);

    for (const reference of references) {
        expect(isTestSignalConfigReference(reference)).toBe(true);
    }

    expect(recommended).toBe(
        references.includes("testSignal.configs.recommended")
    );
};

const assertMessageContract = ({
    metaRecord,
    ruleName,
}: Readonly<{
    metaRecord: Readonly<Record<string, unknown>>;
    ruleName: string;
}>): void => {
    const messages = metaRecord["messages"];

    expect(
        isRecord(messages),
        `Rule '${ruleName}' must define a messages record`
    ).toBe(true);

    if (!isRecord(messages)) {
        return;
    }

    const messageEntries = Object.entries(messages);

    expect(messageEntries.length).toBeGreaterThan(0);

    for (const [messageId, messageTemplate] of messageEntries) {
        expect(
            isNonEmptyString(messageTemplate),
            `Rule '${ruleName}' message '${messageId}' must be non-empty`
        ).toBe(true);
    }
};

describe("rule metadata integrity", () => {
    it("exports processors for plugin shape parity", () => {
        expect.hasAssertions();

        expect(testSignalPlugin).toHaveProperty("processors");
        expect(testSignalPlugin.processors).toStrictEqual({});
    });

    it("keeps src/rules file names in sync with registered rule names", () => {
        expect.hasAssertions();

        const registeredRuleNames = Object.keys(
            testSignalPlugin.rules
        ).toSorted((left, right) => left.localeCompare(right));

        expect(getRuleSourceFileNames()).toStrictEqual(registeredRuleNames);
    });

    it("enforces required metadata invariants for every rule", () => {
        expect.hasAssertions();

        const ruleEntries = Object.entries(testSignalPlugin.rules);
        const seenRuleIds = new Set<string>();
        const seenRuleNumbers = new Set<number>();

        expect(ruleEntries.length).toBeGreaterThan(0);

        for (const [ruleName, ruleModule] of ruleEntries) {
            const ruleRecord = getRuleRecord(ruleName, ruleModule);
            const metaRecord = getRuleMetaRecord(ruleName, ruleRecord);
            const docsRecord = getRuleDocsRecord(ruleName, metaRecord);

            assertBaseRuleMetadataContract({
                metaRecord,
                ruleName,
                ruleRecord,
            });
            assertDocsContract({
                docsRecord,
                ruleName,
            });
            assertMessageContract({
                metaRecord,
                ruleName,
            });

            const docsRuleId = docsRecord["ruleId"];
            const docsRuleNumber = docsRecord["ruleNumber"];

            if (typeof docsRuleId === "string") {
                seenRuleIds.add(docsRuleId);
            }

            if (typeof docsRuleNumber === "number") {
                seenRuleNumbers.add(docsRuleNumber);
            }
        }

        expect(seenRuleIds.size).toBe(ruleEntries.length);
        expect(seenRuleNumbers.size).toBe(ruleEntries.length);
        expect(getSortedRuleNumberValues(seenRuleNumbers)).toStrictEqual(
            getExpectedRegisteredRuleNumbers(
                ruleEntries.map(([ruleName]) => ruleName)
            )
        );
    });
});
