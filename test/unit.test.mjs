import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeCursor, encodeCursor, parseLimit, InvalidQuery } from '../src/cursor.mjs';
import { compareEvents } from '../src/pagination.mjs';

test('cursor round-trips the timestamp and ID without event payload', () => {
  const event = { id: 'evt_002', created_at: '2026-01-01T09:00:00.000Z', type: 'document.updated' };
  assert.deepEqual(decodeCursor(encodeCursor(event)), { created_at: event.created_at, id: event.id });
  assert.equal(decodeCursor(null), null);
});
test('malformed cursors are rejected', () => {
  for (const value of ['', '!', 'e30', Buffer.from('{"id":"evt_002","created_at":"invalid"}').toString('base64url')]) {
    assert.throws(() => decodeCursor(value), InvalidQuery);
  }
});
test('limits accept the default and supported boundaries', () => {
  assert.equal(parseLimit(null), 2);
  assert.equal(parseLimit('1'), 1);
  assert.equal(parseLimit('50'), 50);
});
test('limits reject ambiguous and out-of-range values', () => {
  for (const value of ['', '0', '51', '-1', '2.5', '02', '2abc', ' 2']) {
    assert.throws(() => parseLimit(value), InvalidQuery);
  }
});
test('ordering uses timestamp first and ID to break ties', () => {
  const early = { id: 'evt_009', created_at: '2026-01-01T08:00:00.000Z' };
  const a = { id: 'evt_001', created_at: '2026-01-01T09:00:00.000Z' };
  const b = { ...a, id: 'evt_002' };
  assert.deepEqual([b, early, a].sort(compareEvents), [early, a, b]);
  assert.equal(compareEvents(a, a), 0);
});
