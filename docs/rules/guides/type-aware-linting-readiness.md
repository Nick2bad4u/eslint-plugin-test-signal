# Type-Aware Linting Readiness

The current rules do not require type information.

`testSignal.configs["recommended-type-checked"]` exists as a stable preset name
for future rules that may need parser services. Today it behaves like
`testSignal.configs.recommended` and does not enable `projectService`.
