# Changelog

All notable changes to `eslint-plugin-test-signal` will be documented in this
file.

## Unreleased

- Scaffold the `eslint-plugin-test-signal` package identity, plugin namespace,
  Docusaurus site metadata, README, rule docs, benchmark fixtures, and sync
  surfaces.
- Add initial weak-test-signal rules:
  - `no-empty-async-tests`
  - `require-awaited-async-assertions`
  - `no-snapshot-only-tests`
  - `no-mock-call-only-tests`
  - `require-negative-path`
- Remove template rule implementations, rule docs, tests, fixtures, preset
  pages, and benchmark scenarios that do not belong to this plugin.
