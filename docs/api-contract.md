# Events API contract

`GET /v1/events?limit=2&cursor=...` returns `{ data, next_cursor }` as JSON.

- `limit` defaults to 2 and accepts decimal integers 1–50 without leading zeros.
- Events are ordered ascending by `(created_at, id)`. IDs break timestamp ties.
- The cursor identifies the last event returned. The next page resumes **strictly after** it: no overlap, no skipped events, stable order on this fixed dataset.
- Clients treat the cursor as opaque and follow the exact value returned by the API.
- `next_cursor` is null when no later events remain. An empty result is `{ "data": [], "next_cursor": null }`.
- Invalid limits/cursors, unknown query parameters, and repeated parameters return 400. Other paths return 404. Non-GET methods on this endpoint return 405.
- The six synthetic fixture IDs, in order, are `evt_001` through `evt_006`. The first three share a timestamp; the next two also share a timestamp.

The response schemas in [openapi.json](openapi.json) describe JSON structure. Traversal invariants require assertions across requests. Cursor tokens are encoded, not encrypted or signed, and this teaching API has no authentication, persistent storage or concurrent writes. It does not establish snapshot consistency for a production event stream.
