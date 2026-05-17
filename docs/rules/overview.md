# eslint-plugin-test-signal

`eslint-plugin-test-signal` reports tests that look green while proving too
little about behavior.

The first rule set focuses on common weak-test signals:

- tests whose only assertion is a snapshot;
- tests whose only assertion inspects mock call metadata;
- assertions whose subject is a static constant;
- broad existence assertions that do not verify expected shape or value;
- assertions that compare a value to itself;
- vacuous whole-value asymmetric assertions;
- length assertions that only prove length is non-negative;
- fixed real-time waits that make tests slow or flaky;
- synthetic Promise assertions that do not exercise code under test;
- Promise assertions that are not awaited or returned;
- async tests that contain no assertion;
- suites that have no negative-path coverage signal.

## Design scope

The plugin uses syntax-level heuristics that work across Vitest, Jest-style
APIs, and `@typescript-eslint/rule-tester` suites. It intentionally avoids type
checker work because the targeted patterns are visible directly in the test AST.

## Presets

- `testSignal.configs.minimal` enables the lowest-noise correctness rules.
- `testSignal.configs.recommended` adds weak assertion signal detection,
  including snapshot-only, mock-call-only, constant-subject, and broad existence
  assertions.
- `testSignal.configs["recommended-type-checked"]` currently matches
  `recommended` because no shipped rule requires parser services yet.
- `testSignal.configs.strict` adds negative-path coverage enforcement.
- `testSignal.configs.all` enables every stable rule.
- `testSignal.configs.experimental` is reserved for future candidate rules and
  currently matches `all`.

## Rule reference

| Rule | Purpose |
| --- | --- |
| [`no-empty-async-tests`](./no-empty-async-tests.md) | Flags async tests without assertions. |
| [`require-awaited-async-assertions`](./require-awaited-async-assertions.md) | Flags floating `.resolves` and `.rejects` assertions. |
| [`no-snapshot-only-tests`](./no-snapshot-only-tests.md) | Flags tests whose only assertions are snapshots. |
| [`no-mock-call-only-tests`](./no-mock-call-only-tests.md) | Flags tests whose only assertions inspect mock calls. |
| [`no-constant-assertions`](./no-constant-assertions.md) | Flags assertions whose subject is a static constant. |
| [`no-weak-existence-assertions`](./no-weak-existence-assertions.md) | Flags broad existence assertions such as `toBeDefined()`. |
| [`no-identical-expected-actual`](./no-identical-expected-actual.md) | Flags assertions that compare a value to itself. |
| [`no-weak-asymmetric-assertions`](./no-weak-asymmetric-assertions.md) | Flags vacuous whole-value asymmetric assertions. |
| [`no-tautological-length-assertions`](./no-tautological-length-assertions.md) | Flags length assertions that only prove length is non-negative. |
| [`no-fixed-delay-tests`](./no-fixed-delay-tests.md) | Flags fixed real-time delays in executable tests. |
| [`no-synthetic-promise-assertions`](./no-synthetic-promise-assertions.md) | Flags `.resolves` and `.rejects` assertions against synthetic Promise values. |
| [`require-negative-path`](./require-negative-path.md) | Flags test scopes without negative-path coverage signals. |
