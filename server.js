const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const GENERATE_TIMEOUT_MS = 8 * 60 * 1000;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(ROOT, 'public')));
app.use('/sessions', express.static(path.join(ROOT, 'sessions')));
app.use('/assets', express.static(path.join(ROOT, 'assets')));
app.use('/v5', express.static(path.join(ROOT, 'v5')));

const sessions = new Map();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(ROOT, 'sessions', req.params.id, 'input', 'images');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const dir = path.join(ROOT, 'sessions', req.params.id, 'input', 'images');
      const existing = fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
      const ext = (path.extname(file.originalname) || '.png').toLowerCase();
      cb(null, `${existing + 1}${ext}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function getSession(id) {
  return sessions.get(id);
}

function ensureSession(id) {
  let s = sessions.get(id);
  if (!s) {
    s = { id, state: 'created', createdAt: Date.now() };
    sessions.set(id, s);
  }
  return s;
}

app.post('/api/session', (_req, res) => {
  const id = crypto.randomBytes(4).toString('hex');
  const dir = path.join(ROOT, 'sessions', id, 'input', 'images');
  fs.mkdirSync(dir, { recursive: true });
  ensureSession(id);
  res.json({ id });
});

app.post('/api/session/:id/images', upload.array('images', 30), (req, res) => {
  ensureSession(req.params.id);
  res.json({ count: (req.files || []).length });
});

app.post('/api/session/:id/content', (req, res) => {
  const s = ensureSession(req.params.id);
  const text = (req.body && req.body.text) || '';
  const dir = path.join(ROOT, 'sessions', req.params.id, 'input');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'content.txt'), text, 'utf8');
  s.contentLength = text.length;
  res.json({ ok: true });
});

app.post('/api/session/:id/generate', (req, res) => {
  const id = req.params.id;
  const session = getSession(id);
  if (!session) return res.status(404).json({ error: 'session not found' });
  if (session.state === 'running') return res.json({ state: 'running' });

  session.state = 'running';
  session.startedAt = Date.now();
  session.error = null;

  const prompt = [
    `Generate the video for session ${id}.`,
    ``,
    `Read sessions/${id}/input/content.txt and sessions/${id}/input/images/, then write the complete output to sessions/${id}/output/.`,
    ``,
    `Follow CLAUDE.md exactly. Start by copying v5/ to sessions/${id}/output/, then adapt it.`,
    ``,
    `When sessions/${id}/output/index.html is ready, write the file sessions/${id}/output/.done with content "ok".`,
  ].join('\n');

  const logPath = path.join(ROOT, 'sessions', id, 'claude.log');
  fs.writeFileSync(logPath, `[${new Date().toISOString()}] starting\n`, 'utf8');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  const args = ['-p', prompt, '--dangerously-skip-permissions'];
  const proc = spawn(CLAUDE_BIN, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  proc.stdout.on('data', (d) => logStream.write(d));
  proc.stderr.on('data', (d) => logStream.write(d));

  const killTimer = setTimeout(() => {
    logStream.write(`\n[timeout after ${GENERATE_TIMEOUT_MS}ms — killing]\n`);
    try { proc.kill('SIGTERM'); } catch {}
  }, GENERATE_TIMEOUT_MS);

  proc.on('error', (err) => {
    clearTimeout(killTimer);
    session.state = 'error';
    session.error = `failed to spawn claude: ${err.message}`;
    session.finishedAt = Date.now();
    logStream.write(`\nspawn error: ${err.message}\n`);
    logStream.end();
  });

  proc.on('exit', (code) => {
    clearTimeout(killTimer);
    logStream.write(`\n[exit ${code}]\n`);
    logStream.end();
    const indexPath = path.join(ROOT, 'sessions', id, 'output', 'index.html');
    if (fs.existsSync(indexPath)) {
      session.state = 'done';
      session.outputUrl = `/sessions/${id}/output/index.html`;
    } else {
      session.state = 'error';
      session.error = `claude exited ${code} without producing output`;
    }
    session.finishedAt = Date.now();
  });

  res.json({ state: 'running' });
});

app.get('/api/session/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'not found' });
  res.json({
    id: session.id,
    state: session.state,
    outputUrl: session.outputUrl || null,
    error: session.error || null,
    elapsedMs: session.startedAt ? (session.finishedAt || Date.now()) - session.startedAt : 0,
  });
});

app.listen(PORT, () => {
  console.log(`Blogine demo listening on http://localhost:${PORT}`);
  console.log(`Using claude binary: ${CLAUDE_BIN}`);
});
