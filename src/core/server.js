// Zero-dependency Node static server with SPA fallback to index.html
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
const ROOT = process.env.ROOT ? path.resolve(process.env.ROOT) : process.cwd();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function safeJoin(root, p) {
  const resolved = path.resolve(root, p);
  if (!resolved.startsWith(root)) return root; // prevent path traversal
  return resolved;
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': cacheHeader(ext),
  });
  fs.createReadStream(filePath).pipe(res);
}

function cacheHeader(ext) {
  if (ext === '.html') return 'no-cache';
  return 'public, max-age=31536000, immutable';
}

const server = http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(requestUrl.pathname);

    // Normalize and default to index.html for root
    if (pathname === '/') pathname = '/index.html';

    const filePath = safeJoin(ROOT, '.' + pathname);

    if (exists(filePath) && fs.statSync(filePath).isFile()) {
      return serveFile(res, filePath);
    }

    // If directory, try index.html inside it
    if (exists(filePath) && fs.statSync(filePath).isDirectory()) {
      const indexInDir = path.join(filePath, 'index.html');
      if (exists(indexInDir)) return serveFile(res, indexInDir);
    }

    // SPA fallback: always serve index.html if present
    const fallback = path.join(ROOT, 'index.html');
    if (exists(fallback)) {
      return serveFile(res, fallback);
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error\n' + (e?.message || ''));
  }
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
  console.log(`Serving from: ${ROOT}`);
});
