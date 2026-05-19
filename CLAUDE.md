# hackatoa.com

## Sentinel — Automated Security PR Rules

Sentinel runs periodic security scans and opens Jules PRs for fixes.

### Manual Review Threshold

Only flag a PR for manual review (`⚠️ Manual review needed`) when severity is **HIGH or CRITICAL**.

- `critical` → manual review required
- `high` → manual review required
- `medium` → auto-proceed, no manual review comment
- `low` → auto-proceed, no manual review comment

### Conflict Resolution

If a Sentinel branch has merge conflicts with Main, resolve them automatically:
- For test utility conflicts (mock classes, helper stubs), prefer Main's version.
- For app logic conflicts in `public/`, prefer the Sentinel branch's version.
- Rebase onto Main and force-push the branch. Do not leave conflicts unresolved.

### PR Lifecycle

- Sentinel PRs target `Main`.
- After rebasing to resolve conflicts, the PR remains open for CI to run before merge.
- Do not auto-merge — leave merging to the user after CI passes.
