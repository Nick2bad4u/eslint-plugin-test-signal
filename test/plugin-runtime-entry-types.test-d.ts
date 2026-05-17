/**
 * @packageDocumentation
 * Type-level contract tests for runtime entrypoint declarations.
 */
import type { ESLint } from "eslint";

import testSignalPlugin from "eslint-plugin-test-signal";
import { assertType } from "vitest";

assertType<ESLint.Plugin>(testSignalPlugin);

assertType<ESLint.Plugin["configs"] | undefined>(testSignalPlugin.configs);
assertType<string | undefined>(testSignalPlugin.meta?.name);
assertType<string | undefined>(testSignalPlugin.meta?.version);
assertType<ESLint.Plugin["rules"] | undefined>(testSignalPlugin.rules);
