import { listen } from '../src/server.mjs';

// Starts a temporary API so there is no manual server to keep in sync with edits.
const api = await listen();
const limit = Number(process.argv[2] ?? 2);
const allIds = [];
let cursor = null;
try {
  for (let pageNumber = 1; pageNumber <= 12; pageNumber++) {
    const url = new URL('/v1/events', api.url);
    url.searchParams.set('limit', String(limit));
    if (cursor !== null) url.searchParams.set('cursor', cursor);
    console.log(`GET ${url.pathname}${url.search}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    console.log(`HTTP ${res.status}`);
    const body = await res.json();
    console.log(JSON.stringify(body, null, 2));
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const ids = body.data.map(event => event.id);
    console.log(`Page ${pageNumber}: ${ids.join(', ')}`);
    allIds.push(...ids);
    if (body.next_cursor === null) {
      const unique = new Set(allIds);
      console.log(`Exported ${allIds.length} records; ${unique.size} unique IDs.`);
      console.log(`Sequence: ${allIds.join(', ')}`);
      break;
    }
    if (body.next_cursor === cursor) throw new Error('Cursor did not advance; stopped the demo client.');
    if (pageNumber === 12) throw new Error('Exceeded the 12-request safety limit.');
    cursor = body.next_cursor;
  }
} finally {
  await api.close();
}
