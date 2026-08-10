/**
 * @packageDocumentation
 * Shared fast-check run configuration for property-based test suites.
 */

const defaultFastCheckRunCount = 70 as const;
const ciFastCheckRunCount = 25 as const;
const fastCheckNumRunsEnvironmentVariableName = "FAST_CHECK_NUM_RUNS";
// eslint-disable-next-line n/no-process-env --- We intentionally want to read this environment variable at runtime rather than build time, so that it can be configured by test runners like Vitest and Jest.
const isCiEnvironment = process.env["CI"] === "true";

const resolveFastCheckRunCount = (): number => {
    const rawConfiguredRunCount =
        // eslint-disable-next-line n/no-process-env --- We intentionally want to read this environment variable at runtime rather than build time, so that it can be configured by test runners like Vitest and Jest.
        process.env[fastCheckNumRunsEnvironmentVariableName];

    if (rawConfiguredRunCount !== undefined) {
        const parsedConfiguredRunCount = Number.parseInt(
            rawConfiguredRunCount,
            10
        );

        if (
            Number.isFinite(parsedConfiguredRunCount) &&
            parsedConfiguredRunCount > 0
        ) {
            return parsedConfiguredRunCount;
        }
    }

    return isCiEnvironment ? ciFastCheckRunCount : defaultFastCheckRunCount;
};

export const resolvedFastCheckRunCount: number = resolveFastCheckRunCount();
