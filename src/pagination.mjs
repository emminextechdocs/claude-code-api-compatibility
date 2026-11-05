import { encodeCursor } from './cursor.mjs';

export function compareEvents(a, b) {
  if (a.created_at !== b.created_at) return a.created_at < b.created_at ? -1 : 1;
  return a.id === b.id ? 0 : a.id < b.id ? -1 : 1;
}

export function isAfter(event, cursor) {
  return event.created_at > cursor.created_at ||
    (event.created_at === cursor.created_at && event.id > cursor.id);
}

export function paginate(events, { limit, cursor }) {
  const remaining = [...events].sort(compareEvents)
    .filter(event => cursor === null || isAfter(event, cursor));
  const data = remaining.slice(0, limit);
  const next_cursor = remaining.length > limit ? encodeCursor(data.at(-1)) : null;
  return { data, next_cursor };
}
