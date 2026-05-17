export type ReadmeRuleModule = Readonly<{
    meta?: {
        docs?: {
            testSignalConfigs?: readonly string[] | string;
            url?: string;
        } | undefined;
        fixable?: string | undefined;
        hasSuggestions?: boolean | undefined;
    } | undefined;
}>;

export type ReadmeRulesMap = Readonly<Record<string, unknown>>;

export function extractReadmeRulesSection(markdown: string): string;
export function generateReadmeRulesSectionFromRules(
    rules: ReadmeRulesMap
): string;
export function normalizeRulesSectionMarkdown(markdown: string): string;
export function syncReadmeRulesTable(input: {
    writeChanges: boolean;
}): Promise<Readonly<{ changed: boolean }>>;
