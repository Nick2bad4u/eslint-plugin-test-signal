/**
 * @packageDocumentation
 * Runtime validation coverage for canonical rule docs metadata derivation.
 */
import { describe, expect, it } from "vitest";

import {
    deriveRuleDocsMetadataByName,
    deriveRulePresetMembershipByRuleName,
    deriveTypeCheckedRuleNameSet,
} from "../src/_internal/rule-docs-metadata";
import { testSignalRules } from "../src/_internal/rules-registry";

const fixtureRuleName = "no-empty-async-tests" as const;
const fixtureRule = testSignalRules[fixtureRuleName];
const fixtureDocs = fixtureRule.meta.docs;

if (fixtureDocs === undefined) {
    throw new TypeError("The fixture rule must expose docs metadata.");
}

const rulesWithDocs = (docs: unknown): typeof testSignalRules => {
    const invalidatableDocs = docs as typeof fixtureDocs;

    return {
        ...testSignalRules,
        [fixtureRuleName]: {
            ...fixtureRule,
            meta: {
                ...fixtureRule.meta,
                docs: invalidatableDocs,
            },
        },
    };
};

const deriveWithPatch = (patch: Readonly<Record<string, unknown>>) =>
    deriveRuleDocsMetadataByName(
        rulesWithDocs({
            ...fixtureDocs,
            ...patch,
        })
    );

describe("rule docs metadata derivation", () => {
    it.each([
        undefined,
        null,
        [],
        "invalid",
    ])("rejects a non-object docs contract: %s", (docs) => {
        expect.hasAssertions();
        expect(() => deriveRuleDocsMetadataByName(rulesWithDocs(docs))).toThrow(
            `Rule '${fixtureRuleName}' must declare meta.docs.`
        );
    });

    it.each([
        "",
        " ".repeat(3),
        42,
    ])("rejects an invalid description: %s", (description) => {
        expect.hasAssertions();
        expect(() => deriveWithPatch({ description })).toThrow(
            `Rule '${fixtureRuleName}' must declare a non-empty docs.description.`
        );
    });

    it("requires boolean recommendation and type-checking flags", () => {
        expect.hasAssertions();

        expect(() => deriveWithPatch({ recommended: "true" })).toThrow(
            `Rule '${fixtureRuleName}' must declare boolean docs.recommended.`
        );
        expect(() => deriveWithPatch({ requiresTypeChecking: 1 })).toThrow(
            `Rule '${fixtureRuleName}' must declare boolean docs.requiresTypeChecking.`
        );
    });

    it.each([
        "R12",
        "X001",
        "prefixR001",
        "R001suffix",
        1,
    ])("rejects an invalid rule id: %s", (ruleId) => {
        expect.hasAssertions();
        expect(() => deriveWithPatch({ ruleId })).toThrow(
            `Rule '${fixtureRuleName}' must declare docs.ruleId using the 'R###' format.`
        );
    });

    it.each([
        0,
        -1,
        1.5,
        "1",
    ])("rejects an invalid rule number: %s", (ruleNumber) => {
        expect.hasAssertions();
        expect(() => deriveWithPatch({ ruleNumber })).toThrow(
            `Rule '${fixtureRuleName}' must declare positive integer docs.ruleNumber.`
        );
    });

    it("requires the canonical docs URL", () => {
        expect.hasAssertions();

        expect(() => deriveWithPatch({ url: 42 })).toThrow(
            `Rule '${fixtureRuleName}' must declare docs.url as 'https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/${fixtureRuleName}'.`
        );
        expect(() =>
            deriveWithPatch({ url: "https://example.com/wrong" })
        ).toThrow(
            `Rule '${fixtureRuleName}' must declare docs.url as 'https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/${fixtureRuleName}'.`
        );
    });

    it.each([
        undefined,
        null,
        1,
        {},
        "testSignal.configs.unknown",
        ["testSignal.configs.minimal", 1],
        ["testSignal.configs.unknown"],
    ])("rejects invalid preset references: %s", (testSignalConfigs) => {
        expect.hasAssertions();
        expect(() => deriveWithPatch({ testSignalConfigs })).toThrow(/Rule/v);
    });

    it("rejects an empty preset reference array", () => {
        expect.hasAssertions();

        expect(() => deriveWithPatch({ testSignalConfigs: [] })).toThrow(
            `Rule '${fixtureRuleName}' must declare at least one docs.testSignalConfigs reference.`
        );
    });

    it("normalizes string references and deduplicates array references", () => {
        expect.hasAssertions();

        const singleReference = deriveWithPatch({
            testSignalConfigs: "testSignal.configs.minimal",
        })[fixtureRuleName];
        const duplicateReferences = deriveWithPatch({
            testSignalConfigs: [
                "testSignal.configs.minimal",
                "testSignal.configs.recommended",
                "testSignal.configs.minimal",
            ],
        })[fixtureRuleName];

        expect(singleReference.testSignalConfigReferences).toStrictEqual([
            "testSignal.configs.minimal",
        ]);
        expect(singleReference.testSignalConfigNames).toStrictEqual([
            "minimal",
        ]);
        expect(duplicateReferences.testSignalConfigReferences).toStrictEqual([
            "testSignal.configs.minimal",
            "testSignal.configs.recommended",
        ]);
        expect(duplicateReferences.testSignalConfigNames).toStrictEqual([
            "minimal",
            "recommended",
        ]);
    });

    it("derives type-checked rules and preset membership", () => {
        expect.hasAssertions();

        const metadata = deriveWithPatch({
            requiresTypeChecking: true,
            testSignalConfigs: [
                "testSignal.configs.recommended-type-checked",
                "testSignal.configs.strict",
            ],
        });
        const typeCheckedRuleNames = deriveTypeCheckedRuleNameSet(metadata);
        const presetMembership = deriveRulePresetMembershipByRuleName(metadata);

        expect(typeCheckedRuleNames.has(fixtureRuleName)).toBe(true);
        expect(typeCheckedRuleNames.size).toBe(1);
        expect(presetMembership[fixtureRuleName]).toStrictEqual([
            "recommended-type-checked",
            "strict",
        ]);
        expect(presetMembership[fixtureRuleName]).toBe(
            metadata[fixtureRuleName].testSignalConfigNames
        );
    });
});
