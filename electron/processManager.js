// Gerencia um processo isolado por projeto: fnm use + npm run <script>.
const { spawn, spawnSync, exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_BUFFER = 200_000; // caracteres de log guardados por projeto
const ANSI = /\x1B\[[0-9;?]*[ -/]*[@-~]/g;
// Strings típicas de "servidor pronto" (Angular CLI / webpack / esbuild / Vite)
const READY =
  /(compiled successfully|compiled with warnings|application bundle generation complete|browser bundles|local:\s+http|listening on|is listening on)/i;

const SAFE_VERSION = /^[\w.\-]+$/;
const SAFE_SCRIPT = /^[\w:.\-@/]+$/;

/** id -> { child, buffer, status } */
const procs = new Map();
let emit = () => {};

const setEmitter = (fn) => (emit = fn);
const setStatus = (id, status) => {
  const p = procs.get(id);
  if (p) p.status = status;
  emit('proc:status', { id, status });
};
const append = (id, text) => {
  const p = procs.get(id);
  if (!p) return;
  p.buffer = (p.buffer + text).slice(-MAX_BUFFER);
  emit('proc:data', { id, chunk: text });
};

function ensureEntry(id) {
  if (!procs.has(id)) procs.set(id, { child: null, buffer: '', status: 'stopped' });
  return procs.get(id);
}

function start(id, { dir, nodeVersion, script }) {
  const entry = ensureEntry(id);
  if (entry.child) return { ok: false, error: 'Projeto já está em execução.' };

  const fail = (msg) => {
    append(id, `\r\n[launcher] ${msg}\r\n`);
    return { ok: false, error: msg };
  };
  if (!dir || !fs.existsSync(path.join(dir, 'package.json'))) return fail('package.json não encontrado no diretório.');
  if (!SAFE_VERSION.test(nodeVersion || '')) return fail('Versão do Node inválida.');
  if (!SAFE_SCRIPT.test(script || '')) return fail('Nome de script inválido.');

  // Script .cmd temporário: configura o ambiente do fnm e encadeia use + run.
  const bat = path.join(os.tmpdir(), `angular-launcher-${id}.cmd`);
  fs.writeFileSync(
    bat,
    [
      '@echo off',
      'chcp 65001 >nul',
      `FOR /f "tokens=*" %%i IN ('fnm env --shell cmd') DO CALL %%i`,
      `fnm use "${nodeVersion}"`,
      'if errorlevel 1 exit /b 1',
      `call npm run "${script}"`,
      '',
    ].join('\r\n'),
  );

  entry.buffer += `\r\n> fnm use "${nodeVersion}" && npm run "${script}"\r\n> ${dir}\r\n\r\n`;
  const child = spawn('cmd.exe', ['/d', '/s', '/c', `"${bat}"`], {
    cwd: dir,
    windowsHide: true,
    windowsVerbatimArguments: true,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  entry.child = child;
  setStatus(id, 'starting');

  const onChunk = (buf) => {
    const text = buf.toString('utf8').replace(ANSI, '');
    append(id, text);
    if (entry.status === 'starting' && READY.test(text)) setStatus(id, 'ready');
  };
  child.stdout.on('data', onChunk);
  child.stderr.on('data', onChunk);
  child.on('error', (err) => append(id, `\r\n[launcher] Falha ao iniciar: ${err.message}\r\n`));
  child.on('close', (code) => {
    entry.child = null;
    fs.rm(bat, { force: true }, () => {});
    append(id, `\r\n[launcher] Processo finalizado (código ${code}).\r\n`);
    setStatus(id, 'stopped');
  });
  return { ok: true };
}

/** Mata a árvore inteira (cmd -> npm -> node/ng) e libera a porta. */
function stop(id) {
  return new Promise((resolve) => {
    const entry = procs.get(id);
    if (!entry || !entry.child) return resolve({ ok: true });
    const pid = entry.child.pid;
    exec(`taskkill /PID ${pid} /T /F`, { windowsHide: true }, () => resolve({ ok: true }));
  });
}

function killAllSync() {
  for (const { child } of procs.values()) {
    if (child && child.pid) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
  }
}

const getLog = (id) => procs.get(id)?.buffer ?? '';
const clearLog = (id) => {
  const p = procs.get(id);
  if (p) p.buffer = '';
};

/** `fnm list` -> ["v20.11.0", "v18.19.1", ...] */
function listNodeVersions() {
  return new Promise((resolve) => {
    exec('fnm list', { windowsHide: true, timeout: 15000 }, (err, stdout) => {
      if (err) return resolve({ ok: false, versions: [], error: 'Não foi possível executar "fnm list". O fnm está instalado e no PATH?' });
      const set = new Set();
      for (const line of stdout.split(/\r?\n/)) {
        const m = line.match(/v?(\d+\.\d+\.\d+(?:-[\w.]+)?)/);
        if (m) set.add(`v${m[1]}`);
      }
      resolve({ ok: true, versions: [...set] });
    });
  });
}

/** Valida o diretório e extrai as chaves de "scripts" do package.json. */
function inspectProject(dir) {
  try {
    const file = path.join(dir, 'package.json');
    if (!fs.existsSync(file)) return { ok: false, error: 'package.json não encontrado neste diretório.' };
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    const scripts = Object.keys(pkg.scripts || {});
    if (!scripts.length) return { ok: false, error: 'O package.json não possui scripts.' };
    return { ok: true, scripts, name: pkg.name || '' };
  } catch (e) {
    return { ok: false, error: `package.json inválido: ${e.message}` };
  }
}

module.exports = { setEmitter, start, stop, killAllSync, getLog, clearLog, listNodeVersions, inspectProject };
