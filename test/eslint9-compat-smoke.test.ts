import { describe, expect, it } from "vitest";

import { createIsolatedNpmEnvironment } from "../scripts/eslint9-compat-smoke.mjs";

describe("eslint 9 compatibility smoke environment", () => {
    it("isolates npm policy files and inherited lifecycle flags", () => {
        expect.hasAssertions();

        const environment = createIsolatedNpmEnvironment(
            {
                NPM_CONFIG_ALLOW_SCRIPTS: "esbuild",
                npm_config_globalconfig: "inherited-global",
                npm_config_strict_allow_scripts: "true",
                npm_config_userconfig: "inherited-user",
                PATH: "test-path",
            },
            "isolated-user",
            "isolated-global"
        );

        expect(environment).toMatchObject({
            NPM_CONFIG_GLOBALCONFIG: "isolated-global",
            NPM_CONFIG_USERCONFIG: "isolated-user",
            PATH: "test-path",
        });
        expect(environment).not.toHaveProperty("NPM_CONFIG_ALLOW_SCRIPTS");
        expect(environment).not.toHaveProperty("npm_config_globalconfig");
        expect(environment).not.toHaveProperty(
            "npm_config_strict_allow_scripts"
        );
        expect(environment).not.toHaveProperty("npm_config_userconfig");
    });
});
