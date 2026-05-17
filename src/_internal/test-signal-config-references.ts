/**
 * @packageDocumentation
 * Shared test-signal preset/config reference constants and type guards.
 */

/** Canonical flat-config preset keys exposed through `plugin.configs`. */
export const testSignalConfigNames = [
    "all",
    "experimental",
    "minimal",
    "recommended",
    "recommended-type-checked",
    "strict",
] as const;

/** Metadata contract shared across preset wiring, docs, and README rendering. */
export type TestSignalConfigMetadata = Readonly<{
    icon: string;
    presetName: `test-signal:${TestSignalConfigName}`;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

/** Canonical flat-config preset key type exposed through `plugin.configs`. */
export type TestSignalConfigName = (typeof testSignalConfigNames)[number];

/**
 * Canonical metadata for every exported `test-signal` preset key.
 */
export const testSignalConfigMetadataByName: Readonly<
    Record<TestSignalConfigName, TestSignalConfigMetadata>
> = {
    all: {
        icon: "🟣",
        presetName: "test-signal:all",
        readmeOrder: 5,
        requiresTypeChecking: false,
    },
    experimental: {
        icon: "🧪",
        presetName: "test-signal:experimental",
        readmeOrder: 6,
        requiresTypeChecking: false,
    },
    minimal: {
        icon: "🟢",
        presetName: "test-signal:minimal",
        readmeOrder: 1,
        requiresTypeChecking: false,
    },
    recommended: {
        icon: "🟡",
        presetName: "test-signal:recommended",
        readmeOrder: 2,
        requiresTypeChecking: false,
    },
    "recommended-type-checked": {
        icon: "🟠",
        presetName: "test-signal:recommended-type-checked",
        readmeOrder: 3,
        requiresTypeChecking: false,
    },
    strict: {
        icon: "🔴",
        presetName: "test-signal:strict",
        readmeOrder: 4,
        requiresTypeChecking: false,
    },
};

/** Stable README legend/rendering order for preset icons. */
export const testSignalConfigNamesByReadmeOrder: readonly TestSignalConfigName[] =
    [
        "minimal",
        "recommended",
        "recommended-type-checked",
        "strict",
        "all",
        "experimental",
    ];

/** Metadata references supported in rule docs metadata. */
export const testSignalConfigReferenceToName: Readonly<{
    "testSignal.configs.all": "all";
    "testSignal.configs.experimental": "experimental";
    "testSignal.configs.minimal": "minimal";
    "testSignal.configs.recommended": "recommended";
    "testSignal.configs.recommended-type-checked": "recommended-type-checked";
    "testSignal.configs.strict": "strict";
    'testSignal.configs["recommended-type-checked"]': "recommended-type-checked";
}> = {
    "testSignal.configs.all": "all",
    "testSignal.configs.experimental": "experimental",
    "testSignal.configs.minimal": "minimal",
    "testSignal.configs.recommended": "recommended",
    "testSignal.configs.recommended-type-checked":
        "recommended-type-checked",
    "testSignal.configs.strict": "strict",
    'testSignal.configs["recommended-type-checked"]':
        "recommended-type-checked",
};

/** Fully-qualified preset reference type accepted in docs metadata. */
export type TestSignalConfigReference =
    keyof typeof testSignalConfigReferenceToName;

/**
 * Check whether a string is a supported preset metadata reference.
 */
export const isTestSignalConfigReference = (
    value: string
): value is TestSignalConfigReference =>
    Object.hasOwn(testSignalConfigReferenceToName, value);
