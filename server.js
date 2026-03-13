const express = require('express');
const { exec } = require('child_process');
const { writeFile, mkdir } = require('fs/promises');
const { dirname } = require('path');

const app = express();
app.use(express.json({ limit: '100mb' }));

const PORT = parseInt(process.env.PORT || '3000', 10);
const EXEC_SECRET = process.env.EXEC_SECRET || '';
const MAX_BUFFER = 50 * 1024 * 1024;

function checkAuth(secret) {
  if (!EXEC_SECRET) return true;
  return secret === EXEC_SECRET;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/exec', (req, res) => {
  const { secret, cmd, timeout, cwd } = req.body;
  if (!checkAuth(secret)) return res.status(401).json({ error: 'Unauthorized' });
  if (!cmd) return res.status(400).json({ error: 'cmd is required' });

  exec(cmd, {
    timeout: timeout || 600000,
    maxBuffer: MAX_BUFFER,
    cwd: cwd || undefined,
    env: process.env,
  }, (error, stdout, stderr) => {
    let exitCode = 0;
    if (error) {
      exitCode = error.code || 1;
      if (error.killed) exitCode = 124;
    }
    res.json({ stdout: stdout || '', stderr: stderr || '', exitCode });
  });
});

app.post('/write-file', async (req, res) => {
  const { secret, path, content } = req.body;
  if (!checkAuth(secret)) return res.status(401).json({ error: 'Unauthorized' });
  if (!path) return res.status(400).json({ error: 'path is required' });
  if (typeof content !== 'string') return res.status(400).json({ error: 'content required (base64)' });

  try {
    const buf = Buffer.from(content, 'base64');
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, buf);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[exec-server] Listening on 0.0.0.0:${PORT}`);
});
