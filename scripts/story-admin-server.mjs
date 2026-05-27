import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  PROJECT_ROOT,
  CONTENT_DIR,
  compileAllMissions,
  loadAuthoringMissions,
  validateMissionAuthoring,
} from './story-tools.mjs';

const PORT = Number(process.env.STORY_ADMIN_PORT || 4311);
const STATIC_DIR = path.join(PROJECT_ROOT, 'tools', 'story-admin');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return null;
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function fileNameForMissionId(missionId) {
  return `${missionId.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.json`;
}

async function serveStatic(req, res) {
  const targetPath = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '');
  const fullPath = path.join(STATIC_DIR, targetPath);
  try {
    const contents = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType =
      ext === '.html' ? 'text/html; charset=utf-8' :
      ext === '.css' ? 'text/css; charset=utf-8' :
      ext === '.js' ? 'application/javascript; charset=utf-8' :
      'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(contents);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      res.end('Missing URL');
      return;
    }

    if (req.method === 'GET' && req.url === '/api/missions') {
      const loaded = await loadAuthoringMissions();
      sendJson(res, 200, loaded.map(({ fileName, mission }) => ({
        id: mission.id,
        title: mission.title,
        dayNumber: mission.dayNumber,
        fileName,
      })));
      return;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/missions/')) {
      const missionId = decodeURIComponent(req.url.replace('/api/missions/', ''));
      const fullPath = path.join(CONTENT_DIR, fileNameForMissionId(missionId));
      const raw = await fs.readFile(fullPath, 'utf8');
      sendJson(res, 200, JSON.parse(raw));
      return;
    }

    if (req.method === 'PUT' && req.url.startsWith('/api/missions/')) {
      const missionId = decodeURIComponent(req.url.replace('/api/missions/', ''));
      const payload = await readBody(req);
      if (!payload || payload.id !== missionId) {
        sendJson(res, 400, { error: 'Mission payload id must match URL.' });
        return;
      }
      validateMissionAuthoring(payload);
      const fullPath = path.join(CONTENT_DIR, fileNameForMissionId(missionId));
      await fs.writeFile(fullPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/missions') {
      const payload = await readBody(req);
      if (!payload?.id || !payload?.title) {
        sendJson(res, 400, { error: 'New missions need id and title.' });
        return;
      }
      validateMissionAuthoring(payload);
      const fullPath = path.join(CONTENT_DIR, fileNameForMissionId(payload.id));
      await fs.writeFile(fullPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      sendJson(res, 201, { ok: true });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/compile') {
      const compiled = await compileAllMissions();
      sendJson(res, 200, { ok: true, count: compiled.length });
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

server.listen(PORT, () => {
  console.log(`Story admin running at http://localhost:${PORT}`);
});
