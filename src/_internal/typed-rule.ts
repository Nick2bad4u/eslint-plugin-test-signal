/**
 * @packageDocumentation
 * Internal rule-creator wrapper for eslint-plugin-test-signal rules.
 */
import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";

import type { TestSignalConfigReference } from "./test-signal-config-references.js";

import { getRuleCatalogEntryForRuleNameOrNull } from "./rule-catalog.js";
import { createRuleDocsUrl } from "./rule-docs-url.js";

/**
 * Plugin-specific metadata extensions for `meta.docs`.
 */
export interface TestSignalRuleDocs {
    recommended?: boolean;
    requiresTypeChecking?: boolean;
    ruleId?: string;
    ruleNumber?: number;
    testSignalConfigs?:
        | readonly TestSignalConfigReference[]
        | TestSignalConfigReference;
}

const createRuleCreator: typeof ESLintUtils.RuleCreator =
    ESLintUtils.RuleCreator;

type TestSignalRuleCreator = ReturnType<
    typeof createRuleCreator<TestSignalRuleDocs>
>;

const ruleCreator = createRuleCreator<TestSignalRuleDocs>(createRuleDocsUrl);

/**
 * Rule-creator wrapper used by all plugin rules.
 *
 * @remarks The wrapper injects canonical catalog IDs and validates docs URLs
 * while preserving statically authored rule metadata.
 */
export const createTypedRule: TestSignalRuleCreator = (ruleDefinition) => {
    const createdRule = ruleCreator(ruleDefinition);
    const catalogEntry = getRuleCatalogEntryForRuleNameOrNull(
        ruleDefinition.name
    );
    const canonicalDocsUrl = createRuleDocsUrl(ruleDefinition.name);
    const ruleDocs = createdRule.meta.docs;

    if (ruleDocs === undefined) {
        throw new TypeError(`Rule '${ruleDefinition.name}' must declare meta.docs.`);
    }

    if (ruleDocs.url !== canonicalDocsUrl) {
        throw new TypeError(
            `Rule '${ruleDefinition.name}' has non-canonical docs.url '${String(ruleDocs.url)}'. Expected '${canonicalDocsUrl}'.`
        );
    }

    if (catalogEntry === null) {
        throw new TypeError(
            `Rule '${ruleDefinition.name}' is missing from the stable rule catalog.`
        );
    }

    const docsWithCatalog = {
        ...ruleDocs,
        ruleId: catalogEntry.ruleId,
        ruleNumber: catalogEntry.ruleNumber,
        url: canonicalDocsUrl,
    } satisfies TestSignalRuleDocs & TSESLint.RuleMetaDataDocs;

    return {
        ...createdRule,
        meta: {
            ...createdRule.meta,
            docs: docsWithCatalog,
        },
        name: ruleDefinition.name,
    };
};
