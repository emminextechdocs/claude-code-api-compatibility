import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { listen } from '../src/server.mjs';

const spec = JSON.parse(readFileSync(new URL('../docs/openapi.json', import.meta.url), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true });
const validatePage = ajv.compile(spec.paths['/v1/events'].get.responses['200'].content['application/json'].schema);
const validateError = ajv.compile(spec.paths['/v1/events'].get.responses['400'].content['application/json'].schema);

export async function withApi(t) {
  const api = await listen();
  t.after(() => api.close());
  return api;
}

export async function requestPage(base, { limit = 2, cursor = null } = {}) {
  const url = new URL('/v1/events', base);
  url.searchParams.set('limit', String(limit));
  if (cursor !== null) url.searchParams.set('cursor', cursor);
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^application\/json/);
  const page = await res.json();
  assert.ok(validatePage(page), ajv.errorsText(validatePage.errors));
  return page;
}

export function assertError(body) {
  assert.ok(validateError(body), ajv.errorsText(validateError.errors));
}

export async function traverse(base, limit) {
  const ids = [];
  const seen = new Set();
  let cursor = null;
  for (let pageNumber = 1; pageNumber <= 12; pageNumber++) {
    const page = await requestPage(base, { limit, cursor });
    assert.ok(page.data.length <= limit, `page ${pageNumber} exceeds requested limit`);
    for (const event of page.data) {
      assert.ok(!seen.has(event.id), `duplicate event ${event.id} on page ${pageNumber}`);
      seen.add(event.id);
      ids.push(event.id);
    }
    if (page.next_cursor === null) return ids;
    assert.notEqual(page.next_cursor, cursor, `cursor did not advance on page ${pageNumber}`);
    cursor = page.next_cursor;
  }
  assert.fail('traversal exceeded 12 requests');
}
