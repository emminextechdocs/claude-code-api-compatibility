import test from 'node:test';
import assert from 'node:assert/strict';
import { withApi, requestPage, assertError } from './helpers.mjs';

test('first response matches the published schema', async t => {
  const api = await withApi(t);
  const page = await requestPage(api.url);
  assert.equal(page.data.length, 2);
  assert.equal(typeof page.next_cursor, 'string');
});
test('a subsequent response also matches the published schema', async t => {
  const api = await withApi(t);
  const first = await requestPage(api.url);
  await requestPage(api.url, { cursor: first.next_cursor });
});
test('the complete fixture fits in a large response', async t => {
  const api = await withApi(t);
  const page = await requestPage(api.url, { limit: 50 });
  assert.equal(page.data.length, 6);
  assert.equal(page.next_cursor, null);
});
test('invalid query values return a JSON 400 error', async t => {
  const api = await withApi(t);
  for (const query of ['limit=0', 'limit=51', 'cursor=!', 'limit=2&limit=3', 'extra=true']) {
    const res = await fetch(`${api.url}/v1/events?${query}`, { signal: AbortSignal.timeout(3000) });
    assert.equal(res.status, 400);
    assertError(await res.json());
  }
});
test('route and method errors are explicit', async t => {
  const api = await withApi(t);
  const missing = await fetch(`${api.url}/missing`, { signal: AbortSignal.timeout(3000) });
  assert.equal(missing.status, 404);
  assertError(await missing.json());
  const method = await fetch(`${api.url}/v1/events`, { method: 'POST', signal: AbortSignal.timeout(3000) });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'GET');
  assertError(await method.json());
});
