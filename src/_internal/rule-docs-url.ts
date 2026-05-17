/**
 * @packageDocumentation
 * Canonical rule documentation URL helpers.
 */

/** Stable docs host/prefix for generated rule docs links. */
export const RULE_DOCS_URL_BASE =
    "https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/" as const;

/**
 * Build the canonical documentation URL for one rule id.
 *
 * @param ruleName - Unqualified rule id.
 *
 * @returns Canonical docs URL for the rule page.
 */
export const createRuleDocsUrl = (ruleName: string): string =>
    `${RULE_DOCS_URL_BASE}${ruleName}`;
