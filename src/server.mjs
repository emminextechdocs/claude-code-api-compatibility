import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { events } from './events.mjs';
import { decodeCursor, parseLimit, InvalidQuery } from './cursor.mjs';
import { paginate } from './pagination.mjs';

export function createApi() {
  return createServer((req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(body));
    };
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname !== '/v1/events') return send(404, { error: 'not found' });
      if (req.method !== 'GET') {
        res.setHeader('allow', 'GET');
        return send(405, { error: 'method not allowed' });
      }
      for (const key of url.searchParams.keys()) {
        if (!['limit', 'cursor'].includes(key) || url.searchParams.getAll(key).length !== 1) {
          throw new InvalidQuery('use only limit and cursor, once each');
        }
      }
      const limit = parseLimit(url.searchParams.get('limit'));
      const cursor = decodeCursor(url.searchParams.get('cursor'));
      return send(200, paginate(events, { limit, cursor }));
    } catch (error) {
      if (error instanceof InvalidQuery) return send(400, { error: error.message });
      return send(500, { error: 'internal server error' });
    }
  });
}

export async function listen(port = 0) {
  const server = createApi();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    })
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  const api = await listen(port);
  console.log(`Events API listening at ${api.url}`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
    await api.close();
    process.exit(0);
  });
}
