# Rule Coverage Gaps

This plugin intentionally favors clear, syntax-visible weak-test signals. It
does not prove that a test is complete.

Known gaps:

- custom assertion wrappers are not interpreted;
- project-specific test helpers may hide negative-path coverage;
- computed constants such as `2 + 2` are not folded by
  `no-constant-assertions`;
- alias identity such as `const expected = actual` is not followed by
  `no-identical-expected-actual`;
- computed lower-bound expressions are not folded by
  `no-tautological-length-assertions`;
- non-literal timer durations are not reported by `no-fixed-delay-tests`;
- non-global promise factories are not treated as synthetic by
  `no-synthetic-promise-assertions`;
- visual snapshot review workflows may need local exceptions;
- adapter tests may legitimately assert only mock-boundary calls.
