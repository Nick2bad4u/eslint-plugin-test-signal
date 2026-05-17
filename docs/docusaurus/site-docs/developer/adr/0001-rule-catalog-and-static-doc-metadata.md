# ADR 0001: Rule Catalog and Static Docs Metadata

## Status

Accepted.

## Context

The plugin publishes ESLint rules that flag weak test signals. Rule metadata is
consumed by the runtime plugin, generated README tables, preset docs, rule docs,
and the Docusaurus site. Those surfaces need stable identifiers and authored
documentation instead of runtime-only inference.

## Decision

Keep a static rule catalog in source and require each rule to expose complete
`meta.docs` metadata through the typed rule factory. Generated docs and preset
matrices should read from the built plugin and catalog, then fail validation when
metadata drifts.

## Consequences

- Rule IDs remain stable across generated docs and release output.
- Rule docs stay authored and reviewable.
- Sync failures catch missing preset, README, or docs metadata before publish.
- Adding a rule requires touching source, docs, tests, and preset wiring
  together.
