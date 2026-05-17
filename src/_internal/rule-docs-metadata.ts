/**
 * @packageDocumentation
 * Derivation helpers for canonical rule docs metadata.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import {
    testSignalRuleCatalogEntries,
    type TestSignalRuleNamePattern,
} from "./rule-catalog.js";
import { createRuleDocsUrl } from "./rule-docs-url.js";
import {
    isTestSignalConfigReference,
    type TestSignalConfigName,
    type TestSignalConfigReference,
    testSignalConfigReferenceToName,
} from "./test-signal-config-references.js";

/** Normalized docs metadata derived for each rule. */
export type RuleDocsMetadata = Readonly<{
    description: string;
    recommended: boolean;
    requiresTypeChecking: boolean;
    ruleId: string;
    ruleNumber: number;
    testSignalConfigNames: readonly TestSignalConfigName[];
    testSignalConfigReferences: readonly TestSignalConfigReference[];
    url: string;
}>;

/** Rule-name keyed metadata map derived from static docs contracts. */
export type RuleDocsMetadataByName = Readonly<
    Record<TestSignalRuleNamePattern, RuleDocsMetadata>
>;

/** Rule-map contract accepted by docs metadata derivation helpers. */
type RuleMap = Readonly<
    Record<TestSignalRuleNamePattern, TSESLint.RuleModule<string>>
>;

type TestSignalRuleDocsContract = Readonly<{
    description: string;
    recommended: boolean;
    requiresTypeChecking: boolean;
    ruleId: string;
    ruleNumber: number;
    testSignalConfigs:
        | readonly TestSignalConfigReference[]
        | TestSignalConfigReference;
    url: string;
}>;

const isUnknownRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeConfigReferences = (
    ruleName: string,
    configs: TestSignalRuleDocsContract["testSignalConfigs"]
): readonly TestSignalConfigReference[] => {
    const candidates = typeof configs === "string" ? [configs] : [...configs];
    const references: TestSignalConfigReference[] = [];

    for (const candidate of candidates) {
        if (!isTestSignalConfigReference(candidate)) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid docs.testSignalConfigs reference '${String(candidate)}'.`
            );
        }

        if (!references.includes(candidate)) {
            references.push(candidate);
        }
    }

    if (references.length === 0) {
        throw new TypeError(
            `Rule '${ruleName}' must declare at least one docs.testSignalConfigs reference.`
        );
    }

    return references;
};

const getRuleDocsContract = (
    ruleName: string,
    docs: unknown
): TestSignalRuleDocsContract => {
    if (!isUnknownRecord(docs)) {
        throw new TypeError(`Rule '${ruleName}' must declare meta.docs.`);
    }

    const description = docs["description"];
    const recommended = docs["recommended"];
    const requiresTypeChecking = docs["requiresTypeChecking"];
    const ruleId = docs["ruleId"];
    const ruleNumber = docs["ruleNumber"];
    const testSignalConfigs = docs["testSignalConfigs"];
    const url = docs["url"];

    if (typeof description !== "string" || description.trim().length === 0) {
        throw new TypeError(
            `Rule '${ruleName}' must declare a non-empty docs.description.`
        );
    }

    if (typeof recommended !== "boolean") {
        throw new TypeError(
            `Rule '${ruleName}' must declare boolean docs.recommended.`
        );
    }

    if (typeof requiresTypeChecking !== "boolean") {
        throw new TypeError(
            `Rule '${ruleName}' must declare boolean docs.requiresTypeChecking.`
        );
    }

    if (
        typeof ruleId !== "string" ||
        !/^R\d{3}$/v.test(ruleId)
    ) {
        throw new TypeError(
            `Rule '${ruleName}' must declare docs.ruleId using the 'R###' format.`
        );
    }

    if (
        typeof ruleNumber !== "number" ||
        !Number.isInteger(ruleNumber) ||
        ruleNumber < 1
    ) {
        throw new TypeError(
            `Rule '${ruleName}' must declare positive integer docs.ruleNumber.`
        );
    }

    if (typeof url !== "string" || url !== createRuleDocsUrl(ruleName)) {
        throw new TypeError(
            `Rule '${ruleName}' must declare docs.url as '${createRuleDocsUrl(ruleName)}'.`
        );
    }

    if (typeof testSignalConfigs === "string") {
        if (!isTestSignalConfigReference(testSignalConfigs)) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid docs.testSignalConfigs reference '${testSignalConfigs}'.`
            );
        }

        return {
            description,
            recommended,
            requiresTypeChecking,
            ruleId,
            ruleNumber,
            testSignalConfigs,
            url,
        };
    }

    if (!Array.isArray(testSignalConfigs)) {
        throw new TypeError(
            `Rule '${ruleName}' must declare docs.testSignalConfigs as a preset reference or array.`
        );
    }

    const normalizedTestSignalConfigs: TestSignalConfigReference[] = [];

    for (const configReference of testSignalConfigs) {
        if (
            typeof configReference !== "string" ||
            !isTestSignalConfigReference(configReference)
        ) {
            throw new TypeError(
                `Rule '${ruleName}' has invalid docs.testSignalConfigs reference '${String(configReference)}'.`
            );
        }

        normalizedTestSignalConfigs.push(configReference);
    }

    return {
        description,
        recommended,
        requiresTypeChecking,
        ruleId,
        ruleNumber,
        testSignalConfigs: normalizedTestSignalConfigs,
        url,
    };
};

/**
 * Derive normalized docs metadata for all plugin rules.
 */
export const deriveRuleDocsMetadataByName = (
    rules: RuleMap
): RuleDocsMetadataByName => {
    const metadataByRuleName: Partial<
        Record<TestSignalRuleNamePattern, RuleDocsMetadata>
    > = {};

    for (const { ruleName } of testSignalRuleCatalogEntries) {
        const ruleModule = rules[ruleName];
        const ruleDocs = getRuleDocsContract(ruleName, ruleModule.meta.docs);
        const testSignalConfigReferences = normalizeConfigReferences(
            ruleName,
            ruleDocs.testSignalConfigs
        );
        const testSignalConfigNames = testSignalConfigReferences.map(
            (reference) => testSignalConfigReferenceToName[reference]
        );

        metadataByRuleName[ruleName] = {
            description: ruleDocs.description,
            recommended: ruleDocs.recommended,
            requiresTypeChecking: ruleDocs.requiresTypeChecking,
            ruleId: ruleDocs.ruleId,
            ruleNumber: ruleDocs.ruleNumber,
            testSignalConfigNames,
            testSignalConfigReferences,
            url: ruleDocs.url,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Every key is populated from the canonical rule catalog before returning.
    return metadataByRuleName as RuleDocsMetadataByName;
};

/**
 * Derive a typed-rule set from normalized docs metadata.
 */
export const deriveTypeCheckedRuleNameSet = (
    ruleDocsMetadataByName: RuleDocsMetadataByName
): ReadonlySet<TestSignalRuleNamePattern> => {
    const ruleNames: TestSignalRuleNamePattern[] = [];

    for (const { ruleName } of testSignalRuleCatalogEntries) {
        const metadata = ruleDocsMetadataByName[ruleName];

        if (metadata.requiresTypeChecking) {
            ruleNames.push(ruleName);
        }
    }

    return new Set(ruleNames);
};

/**
 * Derive canonical preset-membership map from normalized docs metadata.
 */
export const deriveRulePresetMembershipByRuleName = (
    ruleDocsMetadataByName: RuleDocsMetadataByName
): Readonly<
    Record<TestSignalRuleNamePattern, readonly TestSignalConfigName[]>
> => {
    const membershipByRuleName: Partial<
        Record<TestSignalRuleNamePattern, readonly TestSignalConfigName[]>
    > = {};

    for (const { ruleName } of testSignalRuleCatalogEntries) {
        const metadata = ruleDocsMetadataByName[ruleName];

        membershipByRuleName[ruleName] = metadata.testSignalConfigNames;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Every key is populated from the canonical rule catalog before returning.
    return membershipByRuleName as Readonly<
        Record<TestSignalRuleNamePattern, readonly TestSignalConfigName[]>
    >;
};
