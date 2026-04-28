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
app.use('/template', express.static(path.join(ROOT, 'template')));

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
    `HEADLESS RUN. Do not ask questions. Do not list options. Do not explain.`,
    `Just do the work and exit when done.`,
    ``,
    `TASK: Generate the 9:16 short-form video for session "${id}".`,
    ``,
    `Inputs are already in place at sessions/${id}/input/:`,
    `  - images/ (numbered 1.<ext>, 2.<ext>, ...)`,
    `  - content.txt (may be empty — if empty, infer the topic and copy from the images themselves; this is intentional, not an error)`,
    ``,
    `Output goes to sessions/${id}/output/. Procedure:`,
    `  1. Copy template/ to sessions/${id}/output/ (preserve every file).`,
    `  2. Edit sessions/${id}/output/index.html — replace scene content with content derived from session "${id}", and rewrite every <img src> to ../input/images/<n>.<ext>.`,
    `  3. Edit sessions/${id}/output/js/player.js — rewrite the SUBTITLES array, set every SCENE_AUDIO entry to '', and adjust SCENES timings so the total is roughly 120 seconds.`,
    `  4. Read CLAUDE.md for the per-scene DOM contract — keep the same class names and structure.`,
    `  5. Verify every scene-N has populated content and every <img src> resolves to a real file in sessions/${id}/input/images/.`,
    `  6. Write sessions/${id}/output/.done containing the text "ok".`,
    ``,
    `Other directories under sessions/ belong to other runs. Do NOT read them, list them, or reference them. Work only inside sessions/${id}/.`,
    ``,
    `Begin now.`,
  ].join('\n');

  const logPath = path.join(ROOT, 'sessions', id, 'claude.log');
  fs.writeFileSync(logPath, `[${new Date().toISOString()}] starting\n`, 'utf8');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  const args = ['--dangerously-skip-permissions', '-p', prompt];
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
    session.error = '생성기를 시작할 수 없어요. 잠시 후 다시 시도해주세요.';
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
      session.error = '결과 파일이 만들어지지 않았어요. 다시 시도해주세요.';
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
});
