---
name: review-api-change
description: Review changes to this events API against its established schema and consumer behavior contract, execute the repository checks, and report compatibility evidence. Use for API change review, not implementation or automatic repair.
disable-model-invocation: true
---

Review the current working tree against the local `api-baseline` tag. If the tag is missing, report that and ask for the intended baseline; do not guess or fetch remotely.

Read `docs/api-contract.md`, `docs/openapi.json`, `package.json`, the changed source and relevant tests, including `test/schema.test.mjs` and `test/helpers.mjs`. Open these files before concluding the review; if any cannot be inspected, mark that part of the review incomplete. Use `git rev-parse api-baseline`, `git status --short`, and `git diff api-baseline -- src docs test package.json` to establish the comparison, including staged and unstaged changes. Run these commands individually from the project root, so each permission decision and exit status is clear. Inspect untracked test files shown by status separately: Git diff does not include their content.

Run `npm run test:unit`, `npm run test:schema`, and `npm run test:contract` separately from the project root. Keep the actual exit status and failure details for each. If the consumer test has not been installed, explicitly report that behavior coverage is missing; do not install it during review. Missing dependencies, permission denials, timeouts or startup problems make the affected check inconclusive. Do not equate those errors with a proven regression.

Connect observed failures to a specific contract expectation and relevant code. Distinguish executed assertions from untested concerns. A passing schema check cannot by itself establish cross-request behavior. A passing suite establishes only its covered expectations.

Leave source, tests, contract, dependencies and Git refs unchanged. Suggest a correction when supported, but do not apply it, create a commit, contact anyone, or publish anything. Keep normal permission controls. Check `git status --short` again after review and report unexpected changes.

Report the baseline SHA, reviewed scope, commands and exit statuses, observed assertion(s), relevant file/line references, suggested correction and remaining coverage limits. Execute fresh checks on every invocation; never reuse a previous run's result as verification of new code.
