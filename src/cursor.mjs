export class InvalidQuery extends Error {}

export function parseLimit(value) {
  if (value === null) return 2;
  if (!/^[1-9][0-9]?$/.test(value) || Number(value) > 50) {
    throw new InvalidQuery('limit must be an integer from 1 to 50');
  }
  return Number(value);
}

export function encodeCursor(event) {
  return Buffer.from(JSON.stringify({ created_at: event.created_at, id: event.id })).toString('base64url');
}

export function decodeCursor(value) {
  if (value === null) return null;
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length > 512) throw new Error();
    const cursor = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor) ||
        Object.keys(cursor).sort().join(',') !== 'created_at,id' ||
        typeof cursor.created_at !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(cursor.created_at) ||
        new Date(cursor.created_at).toISOString() !== cursor.created_at ||
        typeof cursor.id !== 'string' || !/^evt_\d{3}$/.test(cursor.id)) throw new Error();
    if (encodeCursor(cursor) !== value) throw new Error();
    return cursor;
  } catch {
    throw new InvalidQuery('cursor must be an opaque cursor returned by this API');
  }
}
