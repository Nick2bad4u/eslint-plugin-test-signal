/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-test-signal exports and preset wiring.
 */
import type { ESLint, Linter } from "eslint";

import typeScriptParser from "@typescript-eslint/parser";

// eslint-disable-next-line import-x/extensions -- Avoid importing from the ESM entrypoint to preserve CJS compatibility.
import packageJson from "../package.json" with { type: "json" };
import { testSignalRuleCatalogEntries } from "./_internal/rule-catalog.js";
import {
    deriveRuleDocsMetadataByName,
    deriveRulePresetMembershipByRuleName,
    deriveTypeCheckedRuleNameSet,
} from "./_internal/rule-docs-metadata.js";
import { testSignalRules } from "./_internal/rules-registry.js";
import {
    type TestSignalConfigName as InternalTestSignalConfigName,
    testSignalConfigMetadataByName,
    testSignalConfigNames,
} from "./_internal/test-signal-config-references.js";

/** ESLint severity used by generated preset rule maps. */
const ERROR_SEVERITY = "error" as const;

/** Default file globs targeted by plugin presets when `files` is omitted. */
const TYPE_SCRIPT_TEST_FILES = [
    "**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
    "**/__tests__/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
] as const;

/** Canonical flat-config preset keys exposed through `plugin.configs`. */
export type TestSignalConfigName = InternalTestSignalConfigName;

/** Flat-config preset shape produced by this plugin. */
export type TestSignalPresetConfig = Linter.Config & {
    rules: NonNullable<Linter.Config["rules"]>;
};

/** Fully-qualified ESLint rule id used by this plugin. */
export type TestSignalRuleId = `test-signal/${TestSignalRuleName}`;

/** Unqualified rule name supported by `eslint-plugin-test-signal`. */
export type TestSignalRuleName = keyof typeof testSignalRules;

type FlatLanguageOptions = NonNullable<Linter.Config["languageOptions"]>;
type FlatParserOptions = NonNullable<FlatLanguageOptions["parserOptions"]>;
type RulesConfig = TestSignalPresetConfig["rules"];
type TestSignalConfigsContract = Record<
    InternalTestSignalConfigName,
    TestSignalPresetConfig
>;
type TestSignalPluginContract = Omit<ESLint.Plugin, "configs" | "rules"> & {
    configs: TestSignalConfigsContract;
    meta: {
        name: string;
        namespace: string;
        version: string;
    };
    processors: NonNullable<ESLint.Plugin["processors"]>;
    rules: NonNullable<ESLint.Plugin["rules"]>;
};

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

/**
 * Resolve package version from package.json data.
 */
function getPackageVersion(pkg: unknown): string {
    if (!isRecord(pkg)) {
        return "0.0.0";
    }

    const version = pkg["version"];

    return typeof version === "string" ? version : "0.0.0";
}

const packageJsonValue: unknown = packageJson;
const typeScriptParserValue: FlatLanguageOptions["parser"] = typeScriptParser;

const defaultParserOptions = {
    ecmaVersion: "latest",
    sourceType: "module",
} satisfies FlatParserOptions;

const normalizeParserOptions = (
    parserOptions: FlatLanguageOptions["parserOptions"]
): FlatParserOptions =>
    parserOptions !== null &&
    typeof parserOptions === "object" &&
    !Array.isArray(parserOptions)
        ? { ...parserOptions }
        : { ...defaultParserOptions };

const testSignalEslintRules =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- typescript-eslint rule modules are runtime-compatible with ESLint's plugin rule map, but the package types model different context shapes.
    testSignalRules as unknown as NonNullable<ESLint.Plugin["rules"]>;

const ruleDocsMetadataByRuleName =
    deriveRuleDocsMetadataByName(testSignalRules);
const rulePresetMembership = deriveRulePresetMembershipByRuleName(
    ruleDocsMetadataByRuleName
);
const typeCheckedRuleNames = deriveTypeCheckedRuleNameSet(
    ruleDocsMetadataByRuleName
);

const dedupeRuleNames = (
    ruleNames: readonly TestSignalRuleName[]
): TestSignalRuleName[] => [...new Set(ruleNames)];

const createEmptyPresetRuleMap = (): Record<
    InternalTestSignalConfigName,
    TestSignalRuleName[]
> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The map is immediately populated for every canonical config name.
    const presetRuleMap = {} as Record<InternalTestSignalConfigName, TestSignalRuleName[]>;

    for (const configName of testSignalConfigNames) {
        presetRuleMap[configName] = [];
    }

    return presetRuleMap;
};

const derivePresetRuleNamesByConfig = (): Readonly<
    Record<InternalTestSignalConfigName, readonly TestSignalRuleName[]>
> => {
    const presetRuleNamesByConfig = createEmptyPresetRuleMap();

    for (const { ruleName } of testSignalRuleCatalogEntries) {
        const configNames = rulePresetMembership[ruleName];

        if (configNames.length === 0) {
            throw new TypeError(
                `Rule '${ruleName}' is missing preset membership metadata.`
            );
        }

        for (const configName of configNames) {
            presetRuleNamesByConfig[configName].push(ruleName);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The map is immediately populated for every canonical config name.
    const normalizedPresetRuleNamesByConfig = {} as Record<
        InternalTestSignalConfigName,
        readonly TestSignalRuleName[]
    >;

    for (const configName of testSignalConfigNames) {
        normalizedPresetRuleNamesByConfig[configName] = dedupeRuleNames(
            presetRuleNamesByConfig[configName]
        );
    }

    return normalizedPresetRuleNamesByConfig;
};

function errorRulesFor(ruleNames: readonly TestSignalRuleName[]): RulesConfig {
    const rules: RulesConfig = {};

    for (const ruleName of ruleNames) {
        rules[`test-signal/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
}

const presetRuleNamesByConfig = derivePresetRuleNamesByConfig();
const recommendedRuleNames: TestSignalRuleName[] = [];

for (const ruleName of presetRuleNamesByConfig.recommended) {
    if (!typeCheckedRuleNames.has(ruleName)) {
        recommendedRuleNames.push(ruleName);
    }
}

const recommendedTypeCheckedRuleNames = dedupeRuleNames([
    ...recommendedRuleNames,
    ...presetRuleNamesByConfig["recommended-type-checked"],
]);

const effectivePresetRuleNamesByConfig: Readonly<
    Record<InternalTestSignalConfigName, readonly TestSignalRuleName[]>
> = {
    ...presetRuleNamesByConfig,
    experimental: dedupeRuleNames([
        ...presetRuleNamesByConfig.all,
        ...presetRuleNamesByConfig.experimental,
    ]),
    recommended: recommendedRuleNames,
    "recommended-type-checked": recommendedTypeCheckedRuleNames,
};

function withTestSignalPlugin(
    config: Readonly<TestSignalPresetConfig>,
    plugin: Readonly<ESLint.Plugin>,
    options: Readonly<{ requiresTypeChecking: boolean }>
): TestSignalPresetConfig {
    const existingLanguageOptions = config.languageOptions ?? {};
    const existingParserOptions = existingLanguageOptions["parserOptions"];
    const parserOptions = normalizeParserOptions(existingParserOptions);

    if (
        options.requiresTypeChecking &&
        !Object.hasOwn(parserOptions, "projectService")
    ) {
        Reflect.set(parserOptions, "projectService", true);
    }

    const languageOptions: FlatLanguageOptions = {
        ...existingLanguageOptions,
        parser: existingLanguageOptions["parser"] ?? typeScriptParserValue,
        parserOptions,
    };

    return {
        ...config,
        files: config.files ?? [...TYPE_SCRIPT_TEST_FILES],
        languageOptions,
        plugins: {
            ...config.plugins,
            "test-signal": plugin,
        },
    };
}

const pluginForConfigs: ESLint.Plugin = {
    rules: testSignalEslintRules,
};

const createPresetConfig = (
    configName: InternalTestSignalConfigName
): TestSignalPresetConfig => {
    const configMetadata = testSignalConfigMetadataByName[configName];

    return withTestSignalPlugin(
        {
            name: configMetadata.presetName,
            rules: errorRulesFor(effectivePresetRuleNamesByConfig[configName]),
        },
        pluginForConfigs,
        {
            requiresTypeChecking: configMetadata.requiresTypeChecking,
        }
    );
};

const createTestSignalConfigsDefinition = (): TestSignalConfigsContract => ({
    all: createPresetConfig("all"),
    experimental: createPresetConfig("experimental"),
    minimal: createPresetConfig("minimal"),
    recommended: createPresetConfig("recommended"),
    "recommended-type-checked": createPresetConfig("recommended-type-checked"),
    strict: createPresetConfig("strict"),
});

const testSignalConfigs: TestSignalConfigsContract =
    createTestSignalConfigsDefinition();

/** Runtime type for the plugin's generated config presets. */
export type TestSignalConfigs = typeof testSignalConfigs;

/**
 * Main plugin object exported for ESLint consumption.
 */
const testSignalPlugin: TestSignalPluginContract = {
    configs: testSignalConfigs,
    meta: {
        name: "eslint-plugin-test-signal",
        namespace: "test-signal",
        version: getPackageVersion(packageJsonValue),
    },
    processors: {},
    rules: testSignalEslintRules,
};

/** Runtime type for the plugin object exported as default. */
export type TestSignalPlugin = typeof testSignalPlugin;

export default testSignalPlugin;
