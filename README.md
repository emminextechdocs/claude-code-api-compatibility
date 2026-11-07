# Catch breaking API changes with Claude Code Skills

A small, inspectable API compatibility lesson from [Emminex Techdocs](https://emminextechdocs.com/), for engineers familiar with HTTP, Git and automated testing.

The scenario is an intentional cursor-pagination regression. JSON response schemas still pass, while a consumer following the cursor receives duplicate records. A project skill helps review the change using actual test evidence. CI runs deterministic checks without a model account.

## Requirements and quick start

Use Node.js 24 (tested on 24.10.0), npm, and Git. Claude Code with a working account is needed only for the agent review. No database, Docker, external API or cloud account is required for local checks. Account usage terms apply to Claude; no model credentials belong in this repository.

```bash
npm ci
npm run demo:status
npm test
npm run client
```

The client starts and closes its own temporary local HTTP server. Tests use isolated loopback ports and also close them. `npm start` is available for manual requests on port 3000; stop it with Ctrl+C. A busy port causes an error rather than terminating another process.

## Versions of the lesson

- `main` / `lesson-complete`: working implementation with consumer tests, review skill and CI installed.
- `api-baseline`: working implementation with the existing unit/schema tests. Prepared lesson assets are included but not active.
- `walkthrough`: presenter starting branch based on `api-baseline`.

For a fresh lesson walkthrough, use a separate clone and start a new branch at `api-baseline`. Do not switch branches over unsaved work.

```bash
git switch -c my-walkthrough api-baseline
npm ci
npm test
npm run client
npm run demo:regress
git diff -- src/pagination.mjs
npm test
npm run client
npm run lesson:add-contract
npm run test:contract
```

The contract run is expected to fail on the seeded regression. The existing unit and schema checks should still pass. The helper changes one comparison and refuses an unknown state. No tests are removed to manufacture the result.

Install the prepared project skill, inspect it, then launch Claude:

```bash
npm run lesson:add-skill
claude
```

Inside Claude Code, invoke `/review-api-change`. The skill reads the baseline and contract and runs each check separately. It reports evidence and suggests corrections; the lesson keeps source edits with the presenter. Preserve normal tool permission prompts.

Review the comparison in `src/pagination.mjs` and restore the exclusive boundary. You can make that edit yourself, or use `npm run demo:fix`. Then:

```bash
npm test
npm run client
```

Invoke the skill again for a fresh result. Finally use `npm run lesson:add-ci` to install the prepared workflow. Lesson-file installation refuses to overwrite an existing file. On `main` these files are already installed; do not run the add commands again.

## What the checks mean

| Check | Scope |
| --- | --- |
| `npm run test:unit` | Cursor codec, accepted limits, deterministic ordering |
| `npm run test:schema` | HTTP status, response structure, invalid queries, route/method handling |
| `npm run test:contract` | Complete ordered traversal without duplicates, page-size changes, request bound |

The contract test compares against an independent fixed ID sequence. It does not obtain its expectation from the provider's pagination code. The existing unit tests intentionally represent incomplete coverage; unit tests can also catch this boundary if it is asserted directly.

Schema validation uses Ajv against the actual 200 response schema in `docs/openapi.json`. This is not a full OpenAPI conformance validator. The timestamp pattern checks shape, not every possible calendar date. Cross-request guarantees are described in [the contract](docs/api-contract.md) and asserted by the consumer test.

## CI and limits

The GitHub Actions job uses the locked dependency install and runs all three check groups. Its failure blocks merges only if configured as a required check in the repository rules. Passing local tests alone is not evidence of a successful hosted run.

All data is synthetic. The API is a teaching fixture with no authentication or persistent storage. Cursors are encoded, not encrypted or signed. Concurrent writes, snapshot isolation, production performance and security are outside this lesson. A passing test suite proves only the assertions it executes. Skill instructions are not a security sandbox, and model explanations must be checked against execution evidence.

## References

- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Node.js 24 test runner](https://nodejs.org/docs/latest-v24.x/api/test.html)
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html)
- [Ajv schema support](https://ajv.js.org/json-schema.html)
- [Node.js on GitHub Actions](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)

Original code and documentation: [MIT License](LICENSE). Third-party packages retain their own licenses. Emminex name and logo trademark rights are not granted by the code license.
