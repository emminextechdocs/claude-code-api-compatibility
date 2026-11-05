// Fixed synthetic data; equal timestamps make the ID tie-breaker observable.
export const events = Object.freeze([
  { id: 'evt_004', created_at: '2026-01-01T09:01:00.000Z', type: 'document.updated' },
  { id: 'evt_001', created_at: '2026-01-01T09:00:00.000Z', type: 'document.created' },
  { id: 'evt_006', created_at: '2026-01-01T09:02:00.000Z', type: 'document.published' },
  { id: 'evt_003', created_at: '2026-01-01T09:00:00.000Z', type: 'document.updated' },
  { id: 'evt_005', created_at: '2026-01-01T09:01:00.000Z', type: 'document.updated' },
  { id: 'evt_002', created_at: '2026-01-01T09:00:00.000Z', type: 'document.updated' }
].map(Object.freeze));
