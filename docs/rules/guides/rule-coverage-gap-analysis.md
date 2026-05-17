# Rule Coverage Gaps

This plugin intentionally favors clear, syntax-visible weak-test signals. It
does not prove that a test is complete.

Known gaps:

- custom assertion wrappers are not interpreted;
- project-specific test helpers may hide negative-path coverage;
- visual snapshot review workflows may need local exceptions;
- adapter tests may legitimately assert only mock-boundary calls.
