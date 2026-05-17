# Preset Selection Strategy

Use `minimal` when a suite has frequent asynchronous tests and unknown Promise
assertion quality.

Use `recommended` for day-to-day development once the suite is healthy enough to
expect explicit behavior assertions.

Use `strict` selectively for modules where negative paths are part of the public
contract.
