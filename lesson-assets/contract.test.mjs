import test from 'node:test';
import assert from 'node:assert/strict';
import { withApi, requestPage, traverse } from './helpers.mjs';

// Independent consumer expectation, not calculated with the provider's comparator.
const expectedIds = ['evt_001', 'evt_002', 'evt_003', 'evt_004', 'evt_005', 'evt_006'];

for (const limit of [1, 2, 50]) {
  test(`consumer receives every event exactly once in order (limit=${limit})`, { timeout: 10000 }, async t => {
    const api = await withApi(t);
    assert.deepEqual(await traverse(api.url, limit), expectedIds);
  });
}

test('a cursor resumes strictly after its boundary even when page size changes', async t => {
  const api = await withApi(t);
  const first = await requestPage(api.url, { limit: 2 });
  const next = await requestPage(api.url, { limit: 1, cursor: first.next_cursor });
  assert.deepEqual(first.data.map(event => event.id), ['evt_001', 'evt_002']);
  assert.deepEqual(next.data.map(event => event.id), ['evt_003']);
});
