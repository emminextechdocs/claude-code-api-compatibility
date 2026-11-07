# Follow along with the video

Use this guide to reproduce the same progression: ten passing checks, a pagination regression, failing consumer contract tests, a Claude Code review, a manual fix, and fourteen passing checks.

## 1. Clone the starting point

Install Git, Node.js 24 and npm. The `.nvmrc` file specifies the version used for the lesson. Claude Code and a working account are needed only for the review steps; the API and tests run locally without them.

Use a fresh clone so existing edits cannot get mixed into the lesson:

```bash
git clone https://github.com/emminextechdocs/claude-code-api-compatibility.git
cd claude-code-api-compatibility
git switch -c my-walkthrough origin/walkthrough
npm ci
npm run demo:status
npm test
npm run client
```

Expect ten passing tests and six exported records with six unique IDs. Each client run creates and closes its own temporary local server; you do not need `npm start` in another terminal.

If you see fourteen tests already, you are probably on the completed branch. Start the lesson in a fresh clone using the commands above. Do not remove tests to imitate the recording.

## 2. Inspect the contract and introduce the bug

Open `docs/api-contract.md` and `src/pagination.mjs` in your editor. The cursor must resume strictly after its boundary. Events are ordered by timestamp, then ID when timestamps tie.

```bash
git rev-parse api-baseline
npm run demo:regress
git diff -- src/pagination.mjs
npm test
npm run client
```

The diff changes `event.id > cursor.id` to `event.id >= cursor.id`. The ten tests still pass, but the client exports ten records with only six unique IDs. Repeated events cross the page boundaries.

## 3. Install the consumer contract test

```bash
npm run lesson:add-contract
npm run test:contract
```

Expect this command to exit with a failure: three tests fail and one passes. Page sizes one and two expose duplicates, and the changed-page-size case receives `evt_002` instead of `evt_003`. The limit-fifty case passes because all six records fit on one page.

Inspect `test/contract.test.mjs` and `test/helpers.mjs`. The expected ID sequence is explicit; the helper checks HTTP responses, duplicate IDs, cursor progress and a bounded number of requests.

## 4. Review the change with Claude Code

```bash
npm run lesson:add-skill
```

Read `.claude/skills/review-api-change/SKILL.md` before launching Claude. The skill asks for a review, fresh test evidence and a recommendation, while leaving source files and tests unchanged.

From the repository root, use the same launch command shown in the video:

```bash
claude --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}'
```

This uses project settings and an explicitly empty MCP server configuration. Confirm trust only after inspecting the project, and retain normal tool permission checks. At the Claude prompt, invoke:

```text
/review-api-change
```

Check that the report resolves `api-baseline`, inspects the written contract and relevant files, and runs all three test suites. Untracked tests need separate inspection because a normal Git diff omits them. The unit and schema suites should pass; the contract suite should report three failures. Model wording may differ from the recording; verify the commands and results.

## 5. Apply the fix and check it again

In `src/pagination.mjs`, change the equal-timestamp comparison back to:

```js
event.id > cursor.id
```

Save the file, exit Claude if necessary, and run:

```bash
npm test
npm run client
```

Expect fourteen passing checks, then six exported records and six unique IDs. The three client pages contain events 1–2, 3–4 and 5–6, and the final cursor is null.

Launch Claude again with the command above and invoke `/review-api-change` for a fresh review of the repaired files. The source now matches the baseline. Passing these checks does not establish untested production guarantees.

The second review in the video flags a remaining test gap: an exactly full final page should have a null `next_cursor`, but there is no direct assertion for that case. The recording does not implement that follow-up, and this lesson preserves that distinction.

## 6. Inspect CI

```bash
npm run lesson:add-ci
```

Open `.github/workflows/ci.yml`. It installs locked dependencies and runs the unit, schema and contract suites separately. It supports pushes, pull requests and manual dispatch.

In the video, the browser reruns an existing workflow for a prepared commit on `main`. It does not push the local walkthrough changes. To run CI on your own work, fork this repository, commit your changes to your fork and inspect that run's job logs. You do not need access to the Emminex organization to run the lesson locally.

## Returning to the finished example

The default `main` branch already includes the tests, skill and workflow. Use a separate clone for it if you want to keep your lesson edits. The `lesson:add-*` commands intentionally refuse to overwrite existing files; an already-installed message is not a reason to delete your work.

The implementation and test data are a teaching fixture. See the [README](../README.md#ci-and-limits) and [API contract](api-contract.md) for the scope and limitations.
