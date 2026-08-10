export function createIsolatedNpmEnvironment(
    baseEnvironment: Readonly<NodeJS.ProcessEnv>,
    userConfigPath: string,
    globalConfigPath: string
): NodeJS.ProcessEnv;
