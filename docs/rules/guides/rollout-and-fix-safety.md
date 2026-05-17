# Rollout And Fix Safety

Most findings require human judgment because the correct fix is a stronger
assertion, not a mechanical rewrite.

Prefer small pull requests grouped by rule. For each changed test, confirm that
the new assertion checks behavior that a caller or user can observe.
